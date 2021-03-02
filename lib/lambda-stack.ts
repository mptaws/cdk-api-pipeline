import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as codedeploy from '@aws-cdk/aws-codedeploy';
import { RemovalPolicy } from '@aws-cdk/core';

export class LambdaStack extends cdk.Stack {
    public readonly lambdaCode: lambda.CfnParametersCode;

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.lambdaCode = lambda.Code.fromCfnParameters();

        //lambda
        const fn = new lambda.Function(this, "MyLambda", {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'build/lambda.handler',
            code: this.lambdaCode,
            currentVersionOptions: {
                removalPolicy: RemovalPolicy.DESTROY,
                retryAttempts: 1
            }
        });

        // lambdaversion
        const version = fn.currentVersion;
        const alias = new lambda.Alias(this, 'LambdaAlias', {
            aliasName: 'Prod',
            version,
        });

        // codedeploy
        new codedeploy.LambdaDeploymentGroup(this, 'DeploymentGroup', {
            alias,
            deploymentConfig: codedeploy.LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
        });

        // Api gateway
        const apigw = new apigateway.LambdaRestApi(this, "MyAPI", {
            handler: fn,
            proxy: true
        });

        // Cloudfront
        new cloudfront.CloudFrontWebDistribution(this, "MyCf", {
            defaultRootObject: "/",
            originConfigs: [{
                customOriginSource: {
                    domainName: `${apigw.restApiId}.execute-api.${this.region}.${this.urlSuffix}`,
                },
                originPath: '/' + apigw.deploymentStage.stageName,
                behaviors: [{
                    isDefaultBehavior: true,
                }]
            }],
            enableIpV6: true,
        });
    }
}
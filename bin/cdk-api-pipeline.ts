#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LambdaStack } from '../lib/lambda-stack';
import { PipelineStack } from '../lib/cdk-api-pipeline-stack';

if (!process.env.GITHUB_TOKEN) {
    console.log("no gh token");
}

const app = new cdk.App();
const lambdaStack = new LambdaStack(app, 'LambdaStack', {
    env: {
        region: "us-west-2"
    }
});
new PipelineStack(app, 'PipelineStack', {
    lambdaCode: lambdaStack.lambdaCode,
    githubToken: process.env.GITHUB_TOKEN || "",
    env: {
        region: "us-west-2",
    }
});

app.synth();

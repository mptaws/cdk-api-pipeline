#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkApiPipelineStack } from '../lib/cdk-api-pipeline-stack';

const app = new cdk.App();
new CdkApiPipelineStack(app, 'CdkApiPipelineStack');

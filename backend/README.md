# AWS Lambda Deployment Package

This directory contains the Python code for the AWS Lambda function that serves as a proxy to the OpenAI API.

## Files

- `lambda_function.py`: The main Lambda function code
- `requirements.txt`: Dependencies required for the Lambda function
- `template.yaml`: AWS SAM template for deploying the Lambda function

## Deployment Instructions

1. Install the AWS CLI and configure it with your credentials
2. Install the AWS SAM CLI
3. Run `sam build` to build the deployment package
4. Run `sam deploy --guided` to deploy the Lambda function

## Environment Variables

The Lambda function requires the following environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key

## API Gateway Integration

The Lambda function is designed to be integrated with API Gateway to create a RESTful API endpoint.

# LLM-Conversation

A simple web application that provides an interface for having conversations with OpenAI's GPT models. The application consists of a plain HTML/CSS/JS frontend with a chat-like interface and a Python AWS Lambda backend that proxies requests to OpenAI.

## Features

- Chat-like interface for conversations with LLMs
- Backend proxy to OpenAI API via AWS Lambda
- Secure API key storage (keys stored only on the backend)
- Designed for easy migration to other LLM providers

## Structure

- `frontend/`: Contains the HTML, CSS, and JavaScript files for the user interface
- `backend/`: Contains the Python code for the AWS Lambda function

## Requirements

- AWS account for deploying the Lambda function
- OpenAI API key

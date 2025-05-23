.PHONY: clean build-lambda deploy-lambda

# Variables
LAMBDA_DIR = lambda_deployment
PACKAGE_DIR = $(LAMBDA_DIR)/package
ZIP_FILE = $(LAMBDA_DIR)/lambda_deployment.zip

# Default target
all: build-lambda

# Clean build artifacts
clean:
	rm -rf $(LAMBDA_DIR)
	rm -f $(ZIP_FILE)

# Build Lambda deployment package
build-lambda: clean
	# Create deployment directory structure
	mkdir -p $(PACKAGE_DIR)
	
	# Copy lambda function
	cp backend/lambda_function.py $(PACKAGE_DIR)/
	
	# Create requirements.txt
	echo "requests==2.31.0" > $(LAMBDA_DIR)/requirements.txt
	
	# Create and activate virtual environment
	python -m venv $(LAMBDA_DIR)/venv
	. $(LAMBDA_DIR)/venv/bin/activate && \
	pip install -r $(LAMBDA_DIR)/requirements.txt --target $(PACKAGE_DIR)
	
	# Create deployment package
	cd $(PACKAGE_DIR) && zip -r ../lambda_deployment.zip .
	
	# Clean up virtual environment
	rm -rf $(LAMBDA_DIR)/venv
	
	@echo "Lambda deployment package created at $(ZIP_FILE)"

# Deploy Lambda function using AWS CLI
# Usage: make deploy-lambda FUNCTION_NAME=your_lambda_function_name

deploy-lambda:
	@if [ -z "$(FUNCTION_NAME)" ]; then \
		echo "Error: FUNCTION_NAME variable not set. Usage: make deploy-lambda FUNCTION_NAME=your_lambda_function_name"; \
		exit 1; \
	fi
	aws lambda update-function-code --function-name $(FUNCTION_NAME) --zip-file fileb://$(ZIP_FILE) 
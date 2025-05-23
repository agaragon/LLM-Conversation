// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Global variables
let conversationHistory = [];

// Initialize the conversation with the system message
document.addEventListener('DOMContentLoaded', () => {
    // Add the initial system message to the conversation history
    conversationHistory.push({
        role: 'system',
        content: 'Hello! I\'m an AI assistant. How can I help you today?'
    });

    // Set up event listeners
    setupEventListeners();
    
    // Auto-resize the textarea as content changes
    userInput.addEventListener('input', autoResizeTextarea);
});

// Set up event listeners
function setupEventListeners() {
    // Send message when button is clicked
    sendButton.addEventListener('click', sendMessage);
    
    // Send message when Enter key is pressed (without Shift)
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Auto-resize textarea based on content
function autoResizeTextarea() {
    userInput.style.height = 'auto';
    userInput.style.height = (userInput.scrollHeight) + 'px';
}

// Send user message and get AI response
async function sendMessage() {
    const userMessage = userInput.value.trim();
    
    // Don't send empty messages
    if (!userMessage) return;
    
    // Add user message to UI
    addMessageToUI('user', userMessage);
    
    // Add user message to conversation history
    conversationHistory.push({
        role: 'user',
        content: userMessage
    });
    
    // Clear input field and reset height
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // Disable input while waiting for response
    toggleInputState(false);
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Send request to backend
        const response = await sendToBackend(userMessage);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add AI response to UI
        addMessageToUI('assistant', response.message);
        
        // Add AI response to conversation history
        conversationHistory.push({
            role: 'assistant',
            content: response.message
        });
    } catch (error) {
        // Remove typing indicator
        removeTypingIndicator();
        
        // Show error message
        addMessageToUI('system', 'Sorry, there was an error processing your request. Please try again.');
        console.error('Error:', error);
    } finally {
        // Re-enable input
        toggleInputState(true);
        
        // Scroll to bottom
        scrollToBottom();
    }
}

// Add message to UI
function addMessageToUI(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Handle markdown-like formatting for code blocks
    if (content.includes('```')) {
        const formattedContent = formatCodeBlocks(content);
        messageContent.innerHTML = formattedContent;
    } else {
        // Handle regular text with line breaks
        messageContent.innerHTML = content.replace(/\n/g, '<br>');
    }
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to the new message
    scrollToBottom();
}

// Format code blocks in messages
function formatCodeBlocks(content) {
    // Replace code blocks with formatted HTML
    return content.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
                 .replace(/\n/g, '<br>');
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typing-indicator';
    
    const typingContent = document.createElement('div');
    typingContent.className = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        typingContent.appendChild(dot);
    }
    
    typingDiv.appendChild(typingContent);
    chatMessages.appendChild(typingDiv);
    
    scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Toggle input state (enabled/disabled)
function toggleInputState(enabled) {
    userInput.disabled = !enabled;
    sendButton.disabled = !enabled;
}

// Scroll chat to bottom
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message to backend
async function sendToBackend(message) {
    try {
        // Get the conversation history to send to the backend
        const payload = {
            messages: conversationHistory
        };
        
        // Lambda function URL
        const lambdaUrl = 'https://bdoez5u93k.execute-api.us-east-1.amazonaws.com/prod/chat';
        
        const response = await fetch(lambdaUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error sending message to backend:', error);
        throw error;
    }
}

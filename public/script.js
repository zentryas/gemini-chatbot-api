document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');

  /**
   * Appends a message to the chat box.
   * @param {string} sender - The sender of the message ('user' or 'bot').
   * @param {string} text - The message content.
   * @param {string} [id] - An optional ID for the message element.
   */
  const appendMessage = (sender, text, id) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', `${sender}-message`);

    if (text === 'Thinking...') {
      messageElement.classList.add('thinking');
      messageElement.innerHTML = `<span></span><span></span><span></span>`;
    } else {
      messageElement.textContent = text;
    }

    if (id) {
      messageElement.id = id;
    }

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
    return messageElement;
  };

  /**
   * Updates an existing message in the chat box.
   * @param {string} id - The ID of the message element to update.
   * @param {string} newText - The new text content.
   */
  const updateMessage = (id, newText) => {
    const messageElement = document.getElementById(id);
    if (messageElement) {
      messageElement.classList.remove('thinking');
      
      // Format response to handle bold and line breaks for better readability
      const formattedText = newText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
        
      messageElement.innerHTML = formattedText;
    }
  };

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userMessage = userInput.value.trim();
    if (!userMessage) {
      return;
    }

    // 1. Add user's message to the chat box
    appendMessage('user', userMessage);
    userInput.value = ''; // Clear the input

    // 2. Show a temporary "Thinking..." bot message
    const thinkingMessageId = `bot-thinking-${Date.now()}`;
    appendMessage('bot', 'Thinking...', thinkingMessageId);

    try {
      // 3. Send the user's message to the backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: [{ role: 'user', text: userMessage }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server.');
      }

      const data = await response.json();

      // 4. Replace "Thinking..." with the AI's reply
      if (data && data.result) {
        updateMessage(thinkingMessageId, data.result);
      } else {
        // 5. Handle cases where the response is ok but there's no result
        updateMessage(thinkingMessageId, 'Sorry, no response received.');
      }
    } catch (error) {
      console.error('Error fetching chat response:', error);
      // 5. Handle fetch errors
      updateMessage(thinkingMessageId, error.message || 'Failed to get response from server.');
    }
  });
});
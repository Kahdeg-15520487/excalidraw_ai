const { Excalidraw, MainMenu, WelcomeScreen } = window.ExcalidrawLib;
const { useState, useRef, useEffect } = React;

const ChatPanel = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hi! I can help you create and modify diagrams. Try asking me to add shapes, arrows, or text to your canvas.'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        
        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        
        // Simulate AI response (placeholder for future OpenAI integration)
        setTimeout(() => {
            const assistantMessage = {
                role: 'assistant',
                content: 'I received your message: "' + input + '". AI integration coming soon!'
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
        }, 1000);
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    return React.createElement('div', { className: 'chat-panel' },
        React.createElement('div', { className: 'chat-header' },
            React.createElement('h2', null, 'AI Assistant')
        ),
        React.createElement('div', { className: 'chat-messages' },
            messages.map((msg, idx) =>
                React.createElement('div', {
                    key: idx,
                    className: `message ${msg.role}`
                },
                    React.createElement('div', { className: 'message-label' },
                        msg.role === 'user' ? 'You' : 'AI Assistant'
                    ),
                    React.createElement('div', { className: 'message-content' },
                        msg.content
                    )
                )
            ),
            React.createElement('div', { ref: messagesEndRef })
        ),
        React.createElement('div', { className: 'chat-input-container' },
            React.createElement('div', { className: 'chat-input-wrapper' },
                React.createElement('textarea', {
                    className: 'chat-input',
                    placeholder: 'Ask me to create or modify your diagram...',
                    value: input,
                    onChange: (e) => setInput(e.target.value),
                    onKeyPress: handleKeyPress,
                    disabled: isLoading
                }),
                React.createElement('button', {
                    className: 'send-button',
                    onClick: handleSend,
                    disabled: isLoading || !input.trim()
                }, isLoading ? 'Sending...' : 'Send')
            )
        )
    );
};

const App = () => {
    return React.createElement('div', { style: { display: 'flex', height: '100vh', width: '100vw' } },
        React.createElement('div', { className: 'canvas-container' },
            React.createElement(Excalidraw, {
                initialData: {
                    appState: {
                        viewBackgroundColor: '#ffffff'
                    }
                },
                UIOptions: {
                    canvasActions: {
                        loadScene: false,
                        saveAsImage: false,
                        export: false,
                        toggleTheme: false
                    }
                }
            })
        ),
        React.createElement(ChatPanel)
    );
};

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(React.createElement(App));

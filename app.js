const { Excalidraw, MainMenu, WelcomeScreen, Sidebar, Footer } = window.ExcalidrawLib;
const { useState, useRef, useEffect } = React;

const LLMConfiguration = () => {
    const [apiKey, setApiKey] = useState('');
    const [apiEndpoint, setApiEndpoint] = useState('https://api.openai.com/v1');
    const [model, setModel] = useState('gpt-4');
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(2000);

    const handleSaveConfig = () => {
        localStorage.setItem('llm_config', JSON.stringify({
            apiKey,
            apiEndpoint,
            model,
            temperature,
            maxTokens
        }));
        alert('Configuration saved!');
    };

    useEffect(() => {
        const savedConfig = localStorage.getItem('llm_config');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            setApiKey(config.apiKey || '');
            setApiEndpoint(config.apiEndpoint || 'https://api.openai.com/v1');
            setModel(config.model || 'gpt-4');
            setTemperature(config.temperature || 0.7);
            setMaxTokens(config.maxTokens || 2000);
        }
    }, []);

    return React.createElement('div', { style: { padding: '20px', height: '100%', overflow: 'auto' } },
        React.createElement('h3', { style: { marginBottom: '20px', fontSize: '18px', fontWeight: '600' } }, 'LLM Configuration'),

        React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }, 'API Endpoint'),
            React.createElement('input', {
                type: 'text',
                value: apiEndpoint,
                onChange: (e) => setApiEndpoint(e.target.value),
                placeholder: 'https://api.openai.com/v1',
                style: {
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px'
                }
            })
        ),

        React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }, 'API Key'),
            React.createElement('input', {
                type: 'password',
                value: apiKey,
                onChange: (e) => setApiKey(e.target.value),
                placeholder: 'Enter your API key',
                style: {
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px'
                }
            })
        ),

        React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }, 'Model'),
            React.createElement('select', {
                value: model,
                onChange: (e) => setModel(e.target.value),
                style: {
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px'
                }
            },
                React.createElement('option', { value: 'gpt-4' }, 'GPT-4'),
                React.createElement('option', { value: 'gpt-4-turbo' }, 'GPT-4 Turbo'),
                React.createElement('option', { value: 'gpt-3.5-turbo' }, 'GPT-3.5 Turbo')
            )
        ),

        React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } },
                `Temperature: ${temperature}`
            ),
            React.createElement('input', {
                type: 'range',
                min: '0',
                max: '2',
                step: '0.1',
                value: temperature,
                onChange: (e) => setTemperature(parseFloat(e.target.value)),
                style: {
                    width: '100%'
                }
            })
        ),

        React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }, 'Max Tokens'),
            React.createElement('input', {
                type: 'number',
                value: maxTokens,
                onChange: (e) => setMaxTokens(parseInt(e.target.value)),
                min: '100',
                max: '4000',
                style: {
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px'
                }
            })
        ),

        React.createElement('button', {
            onClick: handleSaveConfig,
            style: {
                width: '100%',
                padding: '12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
            }
        }, 'Save Configuration')
    );
};

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

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        const userInput = input;
        setInput('');
        setIsLoading(true);

        try {
            // Get LLM configuration
            const config = JSON.parse(localStorage.getItem('llm_config') || '{}');
            
            if (!config.apiKey) {
                throw new Error('Please configure your API key in the Configuration tab');
            }

            // Prepare messages for API
            const apiMessages = messages.concat([userMessage]).map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Define tools for Excalidraw
            const tools = [
                {
                    type: 'function',
                    function: {
                        name: 'add_rectangle',
                        description: 'Add a rectangle to the Excalidraw canvas',
                        parameters: {
                            type: 'object',
                            properties: {
                                x: { type: 'number', description: 'X coordinate' },
                                y: { type: 'number', description: 'Y coordinate' },
                                width: { type: 'number', description: 'Width of rectangle' },
                                height: { type: 'number', description: 'Height of rectangle' },
                                strokeColor: { type: 'string', description: 'Stroke color (hex)' },
                                backgroundColor: { type: 'string', description: 'Background color (hex)' }
                            },
                            required: ['x', 'y', 'width', 'height']
                        }
                    }
                },
                {
                    type: 'function',
                    function: {
                        name: 'add_text',
                        description: 'Add text to the Excalidraw canvas',
                        parameters: {
                            type: 'object',
                            properties: {
                                x: { type: 'number', description: 'X coordinate' },
                                y: { type: 'number', description: 'Y coordinate' },
                                text: { type: 'string', description: 'Text content' },
                                fontSize: { type: 'number', description: 'Font size' },
                                strokeColor: { type: 'string', description: 'Text color (hex)' }
                            },
                            required: ['x', 'y', 'text']
                        }
                    }
                },
                {
                    type: 'function',
                    function: {
                        name: 'add_arrow',
                        description: 'Add an arrow to the Excalidraw canvas',
                        parameters: {
                            type: 'object',
                            properties: {
                                startX: { type: 'number', description: 'Start X coordinate' },
                                startY: { type: 'number', description: 'Start Y coordinate' },
                                endX: { type: 'number', description: 'End X coordinate' },
                                endY: { type: 'number', description: 'End Y coordinate' },
                                strokeColor: { type: 'string', description: 'Arrow color (hex)' }
                            },
                            required: ['startX', 'startY', 'endX', 'endY']
                        }
                    }
                },
                {
                    type: 'function',
                    function: {
                        name: 'add_ellipse',
                        description: 'Add an ellipse/circle to the Excalidraw canvas',
                        parameters: {
                            type: 'object',
                            properties: {
                                x: { type: 'number', description: 'X coordinate' },
                                y: { type: 'number', description: 'Y coordinate' },
                                width: { type: 'number', description: 'Width of ellipse' },
                                height: { type: 'number', description: 'Height of ellipse' },
                                strokeColor: { type: 'string', description: 'Stroke color (hex)' },
                                backgroundColor: { type: 'string', description: 'Background color (hex)' }
                            },
                            required: ['x', 'y', 'width', 'height']
                        }
                    }
                }
            ];

            // Call OpenAI API
            const response = await fetch(`${config.apiEndpoint}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    model: config.model || 'gpt-4',
                    messages: apiMessages,
                    tools: tools,
                    temperature: config.temperature || 0.7,
                    max_tokens: config.maxTokens || 2000
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API request failed');
            }

            const data = await response.json();
            const assistantMessage = data.choices[0].message;

            // Handle tool calls
            if (assistantMessage.tool_calls) {
                const toolResults = [];
                const toolCallsData = [];
                
                for (const toolCall of assistantMessage.tool_calls) {
                    const functionName = toolCall.function.name;
                    const args = JSON.parse(toolCall.function.arguments);
                    
                    toolCallsData.push({
                        function: functionName,
                        arguments: args
                    });
                    
                    let result;
                    try {
                        switch (functionName) {
                            case 'add_rectangle':
                                result = window.ExcalidrawAPI.addRectangle(
                                    args.x, args.y, args.width, args.height,
                                    { strokeColor: args.strokeColor, backgroundColor: args.backgroundColor }
                                );
                                toolResults.push(`Created rectangle at (${args.x}, ${args.y})`);
                                break;
                            case 'add_text':
                                result = window.ExcalidrawAPI.addText(
                                    args.x, args.y, args.text,
                                    { fontSize: args.fontSize, strokeColor: args.strokeColor }
                                );
                                toolResults.push(`Added text "${args.text}" at (${args.x}, ${args.y})`);
                                break;
                            case 'add_arrow':
                                result = window.ExcalidrawAPI.addArrow(
                                    args.startX, args.startY, args.endX, args.endY,
                                    { strokeColor: args.strokeColor }
                                );
                                toolResults.push(`Created arrow from (${args.startX}, ${args.startY}) to (${args.endX}, ${args.endY})`);
                                break;
                            case 'add_ellipse':
                                result = window.ExcalidrawAPI.addEllipse(
                                    args.x, args.y, args.width, args.height,
                                    { strokeColor: args.strokeColor, backgroundColor: args.backgroundColor }
                                );
                                toolResults.push(`Created ellipse at (${args.x}, ${args.y})`);
                                break;
                        }
                    } catch (error) {
                        toolResults.push(`Error executing ${functionName}: ${error.message}`);
                    }
                }

                // Add response with tool results
                const responseMessage = {
                    role: 'assistant',
                    content: assistantMessage.content || toolResults.join('\n'),
                    toolCalls: toolCallsData
                };
                setMessages(prev => [...prev, responseMessage]);
            } else {
                // Regular text response
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: assistantMessage.content
                }]);
            }
        } catch (error) {
            console.error('Error calling LLM:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${error.message}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleDrawRectangle = () => {
        // Draw a simple rectangle at a random position
        const x = Math.floor(Math.random() * 400) + 100;
        const y = Math.floor(Math.random() * 400) + 100;

        try {
            const result = window.ExcalidrawAPI.addRectangle(x, y, 200, 150, {
                strokeColor: '#007bff',
                backgroundColor: '#e3f2fd',
                fillStyle: 'solid'
            });

            console.log('Rectangle created:', result);

            const message = {
                role: 'assistant',
                content: `Drew a rectangle at position (${x}, ${y})`
            };
            setMessages(prev => [...prev, message]);
        } catch (error) {
            console.error('Error drawing rectangle:', error);
            const message = {
                role: 'assistant',
                content: `Error: ${error.message}`
            };
            setMessages(prev => [...prev, message]);
        }
    };

    const handleDrawText = () => {
        // Draw simple text at a random position
        const x = Math.floor(Math.random() * 400) + 100;
        const y = Math.floor(Math.random() * 400) + 100;

        try {
            const result = window.ExcalidrawAPI.addText(x, y, 'Hello Excalidraw!', {
                strokeColor: '#28a745',
                fontSize: 24
            });

            console.log('Text created:', result);

            const message = {
                role: 'assistant',
                content: `Added text at position (${x}, ${y})`
            };
            setMessages(prev => [...prev, message]);
        } catch (error) {
            console.error('Error drawing text:', error);
            const message = {
                role: 'assistant',
                content: `Error: ${error.message}`
            };
            setMessages(prev => [...prev, message]);
        }
    };

    return React.createElement('div', { className: 'chat-panel' },
        React.createElement('div', { className: 'chat-header' },
            React.createElement('h2', null, 'Chat'),
            React.createElement('div', { style: { display: 'flex', gap: '5px' } },
                React.createElement('button', {
                    className: 'test-button',
                    onClick: handleDrawRectangle,
                    title: 'Draw a test rectangle'
                }, '🔷 Rect'),
                React.createElement('button', {
                    className: 'test-button',
                    onClick: handleDrawText,
                    title: 'Draw test text'
                }, '📝 Text')
            )
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
                    ),
                    msg.toolCalls && React.createElement('div', { 
                        style: { 
                            marginTop: '12px',
                            padding: '12px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '6px',
                            border: '1px solid #e0e0e0'
                        } 
                    },
                        msg.toolCalls.map((toolCall, tcIdx) =>
                            React.createElement('div', {
                                key: tcIdx,
                                style: {
                                    marginBottom: tcIdx < msg.toolCalls.length - 1 ? '8px' : '0'
                                }
                            },
                                React.createElement('div', {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '4px'
                                    }
                                },
                                    React.createElement('span', {
                                        style: {
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: '#6366f1'
                                        }
                                    }, `Tool: ${toolCall.function}`),
                                    React.createElement('button', {
                                        title: JSON.stringify(toolCall.arguments, null, 2),
                                        onClick: () => {
                                            const argsText = JSON.stringify(toolCall.arguments, null, 2);
                                            alert(argsText);
                                        },
                                        style: {
                                            padding: '2px 8px',
                                            fontSize: '11px',
                                            backgroundColor: 'white',
                                            color: '#6366f1',
                                            border: '1px solid #6366f1',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }
                                    }, 'Show Args')
                                ),
                                React.createElement('div', {
                                    style: {
                                        fontSize: '12px',
                                        color: '#16a34a',
                                        paddingLeft: '4px'
                                    }
                                }, `Successfully executed ${toolCall.function}.`)
                            )
                        )
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

// Excalidraw API interface - exposed globally
let excalidrawAPI = null;

// Generate a unique ID for elements
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const ExcalidrawAPI = {
    // Get the current Excalidraw API instance
    getInstance: () => excalidrawAPI,

    // Add a rectangle to the canvas
    addRectangle: (x, y, width, height, options = {}) => {
        if (!excalidrawAPI) {
            console.error('Excalidraw API not ready');
            return null;
        }

        const element = {
            id: generateId(),
            type: 'rectangle',
            x: x,
            y: y,
            width: width,
            height: height,
            angle: 0,
            strokeColor: options.strokeColor || '#000000',
            backgroundColor: options.backgroundColor || 'transparent',
            fillStyle: options.fillStyle || 'solid',
            strokeWidth: options.strokeWidth || 2,
            strokeStyle: options.strokeStyle || 'solid',
            roughness: options.roughness || 1,
            opacity: options.opacity || 100,
            roundness: options.roundness ? { type: 3, value: options.roundness } : null,
            seed: Math.floor(Math.random() * 2147483647),
            version: 1,
            versionNonce: Math.floor(Math.random() * 2147483647),
            isDeleted: false,
            groupIds: [],
            frameId: null,
            boundElements: null,
            updated: Date.now(),
            link: null,
            locked: false
        };

        const currentElements = excalidrawAPI.getSceneElements();
        excalidrawAPI.updateScene({
            elements: [...currentElements, element]
        });

        return element;
    },

    // Add an ellipse/circle to the canvas
    addEllipse: (x, y, width, height, options = {}) => {
        if (!excalidrawAPI) return null;

        const element = {
            id: generateId(),
            type: 'ellipse',
            x: x,
            y: y,
            width: width,
            height: height,
            angle: 0,
            strokeColor: options.strokeColor || '#000000',
            backgroundColor: options.backgroundColor || 'transparent',
            fillStyle: options.fillStyle || 'solid',
            strokeWidth: options.strokeWidth || 2,
            strokeStyle: options.strokeStyle || 'solid',
            roughness: options.roughness || 1,
            opacity: options.opacity || 100,
            seed: Math.floor(Math.random() * 2147483647),
            version: 1,
            versionNonce: Math.floor(Math.random() * 2147483647),
            isDeleted: false,
            groupIds: [],
            frameId: null,
            boundElements: null,
            updated: Date.now(),
            link: null,
            locked: false
        };

        const currentElements = excalidrawAPI.getSceneElements();
        excalidrawAPI.updateScene({
            elements: [...currentElements, element]
        });

        return element;
    },

    // Add a diamond to the canvas
    addDiamond: (x, y, width, height, options = {}) => {
        if (!excalidrawAPI) return null;

        const element = {
            id: generateId(),
            type: 'diamond',
            x: x,
            y: y,
            width: width,
            height: height,
            angle: 0,
            strokeColor: options.strokeColor || '#000000',
            backgroundColor: options.backgroundColor || 'transparent',
            fillStyle: options.fillStyle || 'solid',
            strokeWidth: options.strokeWidth || 2,
            strokeStyle: options.strokeStyle || 'solid',
            roughness: options.roughness || 1,
            opacity: options.opacity || 100,
            seed: Math.floor(Math.random() * 2147483647),
            version: 1,
            versionNonce: Math.floor(Math.random() * 2147483647),
            isDeleted: false,
            groupIds: [],
            frameId: null,
            boundElements: null,
            updated: Date.now(),
            link: null,
            locked: false
        };

        const currentElements = excalidrawAPI.getSceneElements();
        excalidrawAPI.updateScene({
            elements: [...currentElements, element]
        });

        return element;
    },

    // Add an arrow to the canvas
    addArrow: (startX, startY, endX, endY, options = {}) => {
        if (!excalidrawAPI) return null;

        const element = {
            id: generateId(),
            type: 'arrow',
            x: startX,
            y: startY,
            width: endX - startX,
            height: endY - startY,
            angle: 0,
            points: [[0, 0], [endX - startX, endY - startY]],
            strokeColor: options.strokeColor || '#000000',
            backgroundColor: options.backgroundColor || 'transparent',
            fillStyle: options.fillStyle || 'solid',
            strokeWidth: options.strokeWidth || 2,
            strokeStyle: options.strokeStyle || 'solid',
            roughness: options.roughness || 1,
            opacity: options.opacity || 100,
            startArrowhead: options.startArrowhead || null,
            endArrowhead: options.endArrowhead || 'arrow',
            seed: Math.floor(Math.random() * 2147483647),
            version: 1,
            versionNonce: Math.floor(Math.random() * 2147483647),
            isDeleted: false,
            groupIds: [],
            frameId: null,
            boundElements: null,
            updated: Date.now(),
            link: null,
            locked: false
        };

        const currentElements = excalidrawAPI.getSceneElements();
        excalidrawAPI.updateScene({
            elements: [...currentElements, element]
        });

        return element;
    },

    // Add a line to the canvas
    addLine: (startX, startY, endX, endY, options = {}) => {
        if (!excalidrawAPI) return null;

        const element = {
            id: generateId(),
            type: 'line',
            x: startX,
            y: startY,
            width: endX - startX,
            height: endY - startY,
            angle: 0,
            points: [[0, 0], [endX - startX, endY - startY]],
            strokeColor: options.strokeColor || '#000000',
            backgroundColor: options.backgroundColor || 'transparent',
            fillStyle: options.fillStyle || 'solid',
            strokeWidth: options.strokeWidth || 2,
            strokeStyle: options.strokeStyle || 'solid',
            roughness: options.roughness || 1,
            opacity: options.opacity || 100,
            seed: Math.floor(Math.random() * 2147483647),
            version: 1,
            versionNonce: Math.floor(Math.random() * 2147483647),
            isDeleted: false,
            groupIds: [],
            frameId: null,
            boundElements: null,
            updated: Date.now(),
            link: null,
            locked: false
        };

        const currentElements = excalidrawAPI.getSceneElements();
        excalidrawAPI.updateScene({
            elements: [...currentElements, element]
        });

        return element;
    },

    // Add text to the canvas
    addText: (x, y, text, options = {}) => {
        if (!excalidrawAPI) return null;

        const textContent = typeof text === 'string' ? text : String(text || '');
        const fontSize = options.fontSize || 20;

        const element = {
            id: generateId(),
            type: 'text',
            x: x,
            y: y,
            width: options.width || (textContent.length * fontSize * 0.6), // Approximate width
            height: options.height || (fontSize * 1.25), // Approximate height
            angle: 0,
            text: textContent,
            originalText: textContent,
            fontSize: fontSize,
            fontFamily: options.fontFamily || 1,
            textAlign: options.textAlign || 'left',
            verticalAlign: options.verticalAlign || 'top',
            lineHeight: options.lineHeight || 1.25,
            baseline: fontSize * 0.8,
            containerId: null,
            strokeColor: options.strokeColor || '#000000',
            backgroundColor: options.backgroundColor || 'transparent',
            fillStyle: options.fillStyle || 'solid',
            strokeWidth: options.strokeWidth || 2,
            strokeStyle: options.strokeStyle || 'solid',
            roughness: options.roughness || 1,
            opacity: options.opacity || 100,
            seed: Math.floor(Math.random() * 2147483647),
            version: 1,
            versionNonce: Math.floor(Math.random() * 2147483647),
            isDeleted: false,
            groupIds: [],
            frameId: null,
            boundElements: null,
            updated: Date.now(),
            link: null,
            locked: false
        };

        const currentElements = excalidrawAPI.getSceneElements();
        excalidrawAPI.updateScene({
            elements: [...currentElements, element]
        });

        return element;
    },

    // Delete elements by IDs
    deleteElements: (elementIds) => {
        if (!excalidrawAPI) return;

        const currentElements = excalidrawAPI.getSceneElements();
        const filteredElements = currentElements.filter(el => !elementIds.includes(el.id));
        excalidrawAPI.updateScene({
            elements: filteredElements
        });
    },

    // Update an existing element
    updateElement: (elementId, updates) => {
        if (!excalidrawAPI) return null;

        const currentElements = excalidrawAPI.getSceneElements();
        const updatedElements = currentElements.map(el => {
            if (el.id === elementId) {
                return { ...el, ...updates };
            }
            return el;
        });

        excalidrawAPI.updateScene({
            elements: updatedElements
        });

        return updatedElements.find(el => el.id === elementId);
    },

    // Get all elements
    getElements: () => {
        if (!excalidrawAPI) return [];
        return excalidrawAPI.getSceneElements();
    },

    // Get element by ID
    getElementById: (elementId) => {
        if (!excalidrawAPI) return null;
        const elements = excalidrawAPI.getSceneElements();
        return elements.find(el => el.id === elementId);
    },

    // Clear canvas
    clearCanvas: () => {
        if (!excalidrawAPI) return;
        excalidrawAPI.updateScene({
            elements: []
        });
    },

    // Get canvas state as JSON
    getCanvasState: () => {
        if (!excalidrawAPI) return null;
        return {
            elements: excalidrawAPI.getSceneElements(),
            appState: excalidrawAPI.getAppState(),
            files: excalidrawAPI.getFiles()
        };
    }
};

// Expose API globally
window.ExcalidrawAPI = ExcalidrawAPI;

const App = () => {
    const [excalidrawAPIReady, setExcalidrawAPIReady] = useState(false);
    const [docked, setDocked] = useState(true);

    useEffect(() => {
        // Auto-open the sidebar on load
        const timer = setTimeout(() => {
            if (excalidrawAPI) {
                excalidrawAPI.updateScene({
                    appState: {
                        openSidebar: { name: 'custom', tab: 'one' }
                    }
                });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [excalidrawAPIReady]);

    const handleExcalidrawChange = (elements, appState, files) => {
        // This is called when the scene changes
    };

    return React.createElement('div', { style: { display: 'flex', height: '100vh', width: '100vw' } },
        React.createElement('div', { className: 'canvas-container' },
            React.createElement(Excalidraw,
                {
                    excalidrawAPI: (api) => {
                        if (api && !excalidrawAPI) {
                            excalidrawAPI = api;
                            setExcalidrawAPIReady(true);
                            console.log('Excalidraw API ready. Use window.ExcalidrawAPI to interact with the canvas.');
                        }
                    },
                    onChange: handleExcalidrawChange,
                    initialData: {
                        appState: {
                            viewBackgroundColor: '#ffffff',
                            openSidebar: { name: 'custom', tab: 'one' }
                        }
                    },
                    UIOptions: {
                        canvasActions: {
                            loadScene: true,
                            saveAsImage: true,
                            export: {
                                saveFileToDisk: true,
                            },
                            toggleTheme: true
                        }
                    }
                },
                React.createElement(MainMenu, null,
                    React.createElement(MainMenu.DefaultItems.LoadScene)
                    ,
                    React.createElement(MainMenu.DefaultItems.SaveAsImage)
                    ,
                    React.createElement(MainMenu.DefaultItems.Export)
                    ,
                    React.createElement(MainMenu.DefaultItems.ClearCanvas)
                    ,
                    React.createElement(MainMenu.DefaultItems.ToggleTheme),

                    React.createElement(Sidebar.Trigger, {
                        name: 'custom',
                        tab: 'one',
                        style: {
                            marginLeft: '0.5rem',
                            background: '#70b1ec',
                            color: 'white'
                        }
                    }, 'Toggle AI Assistant')
                ),
                React.createElement(Sidebar, { name: 'custom', docked: docked, onDock: setDocked, style: { width: '500px' } },
                    React.createElement(Sidebar.Header, null,
                        React.createElement('h2', null, 'AI Assistant'),
                    ),
                    React.createElement(Sidebar.Tabs, { style: { padding: '0.5rem', height: '100%', display: 'flex', flexDirection: 'column' } },
                        React.createElement(Sidebar.Tab, { tab: 'one', style: { flex: 1, overflow: 'auto' } },
                            React.createElement(ChatPanel)
                        ),
                        React.createElement(Sidebar.Tab, { tab: 'two', style: { flex: 1, overflow: 'auto' } },
                            React.createElement(LLMConfiguration)
                        ),
                        React.createElement(Sidebar.TabTriggers, null,
                            React.createElement(Sidebar.TabTrigger, { tab: 'one' }, 'Chat'),
                            React.createElement(Sidebar.TabTrigger, { tab: 'two' }, 'Configuration')
                        )
                    )
                )
            )
        )
    );
};

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(React.createElement(App));

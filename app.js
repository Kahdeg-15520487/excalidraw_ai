const { Excalidraw, MainMenu, WelcomeScreen, Sidebar, Footer } = window.ExcalidrawLib;
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
            React.createElement('h2', null, 'AI Assistant'),
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
                            viewBackgroundColor: '#ffffff'
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
                React.createElement(Sidebar, { name: 'custom', docked: docked, onDock: setDocked },
                    React.createElement(Sidebar.Header),
                    React.createElement(Sidebar.Tabs, { style: { padding: '0.5rem' } },
                        React.createElement(Sidebar.Tab, { tab: 'one' }, 'Tab one!'),
                        React.createElement(Sidebar.Tab, { tab: 'two' }, 'Tab two!'),
                        React.createElement(Sidebar.TabTriggers, null,
                            React.createElement(Sidebar.TabTrigger, { tab: 'one' }, 'One'),
                            React.createElement(Sidebar.TabTrigger, { tab: 'two' }, 'Two')
                        )
                    )
                )
            )
        ),
        React.createElement(ChatPanel)
    );
};

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(React.createElement(App));

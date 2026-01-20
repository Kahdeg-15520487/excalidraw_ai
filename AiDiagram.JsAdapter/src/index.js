import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

// Generate unique ID for elements
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const ExcalidrawWrapper = forwardRef((props, ref) => {
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);

    useImperativeHandle(ref, () => ({
        getAPI: () => excalidrawAPI,
        updateScene: (sceneData) => {
            if (excalidrawAPI) {
                excalidrawAPI.updateScene(sceneData);
            }
        },
        getSceneElements: () => {
            return excalidrawAPI ? excalidrawAPI.getSceneElements() : [];
        },
        getAppState: () => {
            return excalidrawAPI ? excalidrawAPI.getAppState() : null;
        }
    }));

    return (
        <div style={{ height: "100%", width: "100%" }}>
            <Excalidraw
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                initialData={props.initialData}
            />
        </div>
    );
});

// Store Excalidraw instances by container ID
window.excalidrawInstances = window.excalidrawInstances || {};

// Mount Excalidraw to a container
window.mountExcalidraw = (containerId, dotnetRef) => {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('[Excalidraw] Container not found:', containerId);
        return;
    }

    const root = createRoot(container);
    const ref = React.createRef();

    root.render(<ExcalidrawWrapper ref={ref} />);

    window.excalidrawInstances[containerId] = ref;
    console.log('[Excalidraw] Mounted to container:', containerId);
};

// ============================================
// ExcalidrawAPI - Full API ported from legacy
// ============================================

window.ExcalidrawAPI = {
    // Get the Excalidraw API instance for a container
    getInstance: (containerId) => {
        const ref = window.excalidrawInstances?.[containerId];
        return ref?.current?.getAPI?.() || null;
    },

    // Add a rectangle to the canvas
    addRectangle: (containerId, x, y, width, height, options = {}) => {
        const api = window.ExcalidrawAPI.getInstance(containerId);
        if (!api) {
            console.error('[ExcalidrawAPI] No instance found for:', containerId);
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

        const currentElements = api.getSceneElements();
        api.updateScene({ elements: [...currentElements, element] });
        console.log('[ExcalidrawAPI] Added rectangle:', element.id);
        return element.id;
    },

    // Add an ellipse to the canvas
    addEllipse: (containerId, x, y, width, height, options = {}) => {
        const api = window.ExcalidrawAPI.getInstance(containerId);
        if (!api) return null;

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

        const currentElements = api.getSceneElements();
        api.updateScene({ elements: [...currentElements, element] });
        console.log('[ExcalidrawAPI] Added ellipse:', element.id);
        return element.id;
    },

    // Add a diamond to the canvas
    addDiamond: (containerId, x, y, width, height, options = {}) => {
        const api = window.ExcalidrawAPI.getInstance(containerId);
        if (!api) return null;

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

        const currentElements = api.getSceneElements();
        api.updateScene({ elements: [...currentElements, element] });
        console.log('[ExcalidrawAPI] Added diamond:', element.id);
        return element.id;
    },

    // Add an arrow to the canvas
    addArrow: (containerId, startX, startY, endX, endY, options = {}) => {
        const api = window.ExcalidrawAPI.getInstance(containerId);
        if (!api) return null;

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

        const currentElements = api.getSceneElements();
        api.updateScene({ elements: [...currentElements, element] });
        console.log('[ExcalidrawAPI] Added arrow:', element.id);
        return element.id;
    },

    // Add a line to the canvas
    addLine: (containerId, startX, startY, endX, endY, options = {}) => {
        const api = window.ExcalidrawAPI.getInstance(containerId);
        if (!api) return null;

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

        const currentElements = api.getSceneElements();
        api.updateScene({ elements: [...currentElements, element] });
        console.log('[ExcalidrawAPI] Added line:', element.id);
        return element.id;
    },

    // Add text to the canvas
    addText: (containerId, x, y, text, options = {}) => {
        const api = window.ExcalidrawAPI.getInstance(containerId);
        if (!api) return null;

        const textContent = typeof text === 'string' ? text : String(text || '');
        const fontSize = options.fontSize || 20;

        const element = {
            id: generateId(),
            type: 'text',
            x: x,
            y: y,
            width: options.width || (textContent.length * fontSize * 0.6),
            height: options.height || (fontSize * 1.25),
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

        const currentElements = api.getSceneElements();
        api.updateScene({ elements: [...currentElements, element] });
        console.log('[ExcalidrawAPI] Added text:', element.id);
        return element.id;
    },

    // Generic addElement - routes to specific method based on type
    addElement: (containerId, elementData) => {
        console.log('[ExcalidrawAPI] addElement called:', containerId, elementData);

        const type = elementData.type;
        const x = elementData.x ?? 0;
        const y = elementData.y ?? 0;
        const width = elementData.width ?? 100;
        const height = elementData.height ?? 100;
        const options = {
            strokeColor: elementData.strokeColor,
            backgroundColor: elementData.backgroundColor,
            fontSize: elementData.fontSize
        };

        switch (type) {
            case 'rectangle':
                return window.ExcalidrawAPI.addRectangle(containerId, x, y, width, height, options);
            case 'ellipse':
                return window.ExcalidrawAPI.addEllipse(containerId, x, y, width, height, options);
            case 'diamond':
                return window.ExcalidrawAPI.addDiamond(containerId, x, y, width, height, options);
            case 'arrow':
                const endX = elementData.endX ?? (x + width);
                const endY = elementData.endY ?? (y + height);
                return window.ExcalidrawAPI.addArrow(containerId, elementData.startX ?? x, elementData.startY ?? y, endX, endY, options);
            case 'line':
                const lineEndX = elementData.endX ?? (x + width);
                const lineEndY = elementData.endY ?? (y + height);
                return window.ExcalidrawAPI.addLine(containerId, elementData.startX ?? x, elementData.startY ?? y, lineEndX, lineEndY, options);
            case 'text':
                return window.ExcalidrawAPI.addText(containerId, x, y, elementData.text || '', options);
            default:
                console.error('[ExcalidrawAPI] Unknown element type:', type);
                return null;
        }
    },

    // Update an existing element
    updateElement: (containerId, elementId, updates) => {
        const api = window.ExcalidrawAPI.getInstance(containerId);
        if (!api) return false;

        const currentElements = api.getSceneElements();
        let found = false;

        const updatedElements = currentElements.map(el => {
            if (el.id === elementId) {
                found = true;
                return {
                    ...el,
                    ...updates,
                    version: (el.version || 0) + 1,
                    versionNonce: Math.floor(Math.random() * 2147483647),
                    updated: Date.now()
                };
            }
            return el;
        });

        if (found) {
            api.updateScene({ elements: updatedElements });
            console.log('[ExcalidrawAPI] Updated element:', elementId);
        } else {
            console.warn('[ExcalidrawAPI] Element not found:', elementId);
        }

        return found;
    },

    // Delete elements by IDs
    deleteElements: (containerId, elementIds) => {
        const api = window.ExcalidrawAPI.getInstance(containerId);
        if (!api) return;

        const idsArray = Array.isArray(elementIds) ? elementIds : [elementIds];
        const currentElements = api.getSceneElements();
        const filteredElements = currentElements.filter(el => !idsArray.includes(el.id));

        api.updateScene({ elements: filteredElements });
        console.log('[ExcalidrawAPI] Deleted elements:', idsArray);
    },

    // Get element by ID
    getElementById: (containerId, elementId) => {
        const api = window.ExcalidrawAPI.getInstance(containerId);
        if (!api) return null;

        const elements = api.getSceneElements();
        return elements.find(el => el.id === elementId) || null;
    },

    // Get all elements
    getElements: (containerId) => {
        const api = window.ExcalidrawAPI.getInstance(containerId);
        return api ? api.getSceneElements() : [];
    },

    // Clear the canvas
    clearCanvas: (containerId) => {
        const api = window.ExcalidrawAPI.getInstance(containerId);
        if (api) {
            api.updateScene({ elements: [] });
            console.log('[ExcalidrawAPI] Canvas cleared');
        }
    },

    // Get canvas state (elements + appState)
    getCanvasState: (containerId) => {
        const api = window.ExcalidrawAPI.getInstance(containerId);
        if (!api) return null;

        return {
            elements: api.getSceneElements(),
            appState: api.getAppState()
        };
    }
};

// Legacy compatibility - keep the old function for backward compatibility
window.addExcalidrawElements = (containerId, elements) => {
    console.log('[Excalidraw] Legacy addExcalidrawElements called');
    const elementsArray = Array.isArray(elements) ? elements : [elements];
    elementsArray.forEach(el => window.ExcalidrawAPI.addElement(containerId, el));
};

window.updateExcalidrawScene = (containerId, sceneData) => {
    const ref = window.excalidrawInstances?.[containerId];
    if (ref && ref.current) {
        ref.current.updateScene(sceneData);
    }
};

// ============================================
// ChatHistoryDB - IndexedDB for chat history
// ============================================

const DB_NAME = 'AiDiagramChatDB';
const DB_VERSION = 1;
const STORE_NAME = 'chatHistory';

let dbInstance = null;
let dbPromise = null;

const openDatabase = () => {
    if (dbInstance) {
        return Promise.resolve(dbInstance);
    }

    if (dbPromise) {
        return dbPromise;
    }

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('[ChatHistoryDB] Failed to open database:', request.error);
            dbPromise = null;
            reject(request.error);
        };

        request.onsuccess = () => {
            dbInstance = request.result;
            console.log('[ChatHistoryDB] Database opened successfully');
            resolve(dbInstance);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                store.createIndex('sessionId', 'sessionId', { unique: false });
                console.log('[ChatHistoryDB] Object store created');
            }
        };
    });

    return dbPromise;
};

window.ChatHistoryDB = {
    // Initialize database
    init: async () => {
        await openDatabase();
        console.log('[ChatHistoryDB] Initialized');
    },

    // Save a message to history
    saveMessage: async (sessionId, message) => {
        console.log('[ChatHistoryDB] Saving message for session:', sessionId);
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const record = {
                sessionId: sessionId,
                content: message.content,
                isUser: message.isUser,
                isToolCall: message.isToolCall || false,
                toolAction: message.toolAction || null,
                timestamp: Date.now()
            };

            const request = store.add(record);
            request.onsuccess = () => {
                console.log('[ChatHistoryDB] Message saved successfully:', record);
                resolve(request.result);
            };
            request.onerror = () => {
                console.error('[ChatHistoryDB] Failed to save message:', request.error);
                reject(request.error);
            };
        });
    },

    // Get all messages for a session
    getHistory: async (sessionId) => {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('sessionId');
            const request = index.getAll(sessionId);

            request.onsuccess = () => {
                const messages = request.result.sort((a, b) => a.timestamp - b.timestamp);
                console.log('[ChatHistoryDB] Retrieved history for session', sessionId, ':', messages.length, 'messages');
                resolve(messages);
            };
            request.onerror = () => {
                console.error('[ChatHistoryDB] Failed to get history:', request.error);
                reject(request.error);
            };
        });
    },

    // Clear history for a session
    clearHistory: async (sessionId) => {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('sessionId');
            const request = index.openCursor(sessionId);

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    console.log('[ChatHistoryDB] History cleared for session:', sessionId);
                    resolve();
                }
            };
            request.onerror = () => {
                console.error('[ChatHistoryDB] Failed to clear history:', request.error);
                reject(request.error);
            };
        });
    },

    // Get history formatted for LLM (just role + content)
    getHistoryForLLM: async (sessionId) => {
        const messages = await window.ChatHistoryDB.getHistory(sessionId);
        return messages
            .filter(m => !m.isToolCall) // Exclude tool calls from LLM history
            .map(m => ({
                role: m.isUser ? 'user' : 'assistant',
                content: m.content
            }));
    },

    // Get all unique sessions with metadata
    getAllSessions: async () => {
        console.log('[ChatHistoryDB] Getting all sessions...');
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const messages = request.result;
                console.log('[ChatHistoryDB] Raw messages found:', messages.length);

                // Group by sessionId and get first/last message for each
                const sessionsMap = new Map();
                messages.forEach(msg => {
                    if (!msg.sessionId) {
                        console.warn('[ChatHistoryDB] Found message without sessionId:', msg);
                        return;
                    }

                    if (!sessionsMap.has(msg.sessionId)) {
                        sessionsMap.set(msg.sessionId, {
                            sessionId: msg.sessionId,
                            messageCount: 0,
                            firstMessage: msg.timestamp,
                            lastMessage: msg.timestamp,
                            preview: msg.content?.substring(0, 50) || ''
                        });
                    }
                    const session = sessionsMap.get(msg.sessionId);
                    session.messageCount++;
                    if (msg.timestamp < session.firstMessage) {
                        session.firstMessage = msg.timestamp;
                        if (msg.isUser) session.preview = msg.content?.substring(0, 50) || '';
                    }
                    if (msg.timestamp > session.lastMessage) {
                        session.lastMessage = msg.timestamp;
                    }
                });

                const sessions = Array.from(sessionsMap.values())
                    .sort((a, b) => b.lastMessage - a.lastMessage);
                console.log('[ChatHistoryDB] Unique sessions found:', sessions.length, sessions);
                resolve(sessions);
            };
            request.onerror = () => {
                console.error('[ChatHistoryDB] Failed to get sessions:', request.error);
                reject(request.error);
            };
        });
    },

    // Delete a session
    deleteSession: async (sessionId) => {
        await window.ChatHistoryDB.clearHistory(sessionId);
        console.log('[ChatHistoryDB] Session deleted:', sessionId);
    }
};


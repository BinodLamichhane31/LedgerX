import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, User, Sparkles } from 'lucide-react';
import { useHisabAssistant } from '../../hooks/useBot';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const Message = ({ message }) => {
    const isBot = message.role === 'model';
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-start gap-3 w-full ${isBot ? '' : 'justify-end'}`}
        >
            {isBot && <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-white rounded-full shadow-md bg-gradient-to-br from-primary-500 to-secondary-500"><Bot size={18} /></div>}
            <div className={`p-3 rounded-xl max-w-[85%] prose prose-sm ${isBot ? 'bg-gray-100 text-gray-800' : 'bg-primary-600 text-white prose-invert'}`}>
                <ReactMarkdown
                    components={{
                        a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-inherit hover:underline" />
                    }}
                >
                    {message.parts[0].text}
                </ReactMarkdown>
            </div>
            {!isBot && <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-gray-600 bg-gray-200 rounded-full shadow-md"><User size={18} /></div>}
        </motion.div>
    );
};

const TypingIndicator = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex items-center max-w-sm gap-2 p-3 bg-gray-100 rounded-lg"
    >
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
    </motion.div>
);

export default function HisabAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [conversation, setConversation] = useState([
        { role: 'model', parts: [{ text: "Hello! I am Ledger AI. Ask me anything about business registration, tax, or your sales/purchases in Nepal." }] }
    ]);
    const chatEndRef = useRef(null);

    const { mutate: ask, isPending } = useHisabAssistant();

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, isPending]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || isPending) return;

        const userMessage = { role: 'user', parts: [{ text: input }] };
        const newConversation = [...conversation, userMessage];
        setConversation(newConversation);
        setInput('');

        const apiHistory = newConversation.slice(1, -1);

        ask({ query: input, conversationHistory: apiHistory }, {
            onSuccess: (data) => {
                const botMessage = { role: 'model', parts: [{ text: data.reply }] };
                setConversation(prev => [...prev, botMessage]);
            },
            onError: (error) => {
                const errorMessage = { role: 'model', parts: [{ text: `Sorry, something went wrong: ${error.message}` }] };
                setConversation(prev => [...prev, errorMessage]);
            }
        });
    };

    return (
        <>
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed z-50 flex items-center justify-center w-16 h-16 text-white rounded-full shadow-2xl bg-primary-600 bottom-5 right-5 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                aria-label="Toggle Ledger Assistant"
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <AnimatePresence>
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0 }}>
                            <X size={30} />
                        </motion.div>
                    ) : (
                         <motion.div key="open" initial={{ rotate: 90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: -90, scale: 0 }}>
                            <Bot size={30} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-24 right-5 w-96 h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50"
                    >
                        <header className="flex items-center flex-shrink-0 gap-3 p-4 text-white bg-gradient-to-br from-primary-600 to-secondary-600 rounded-t-2xl">
                            <Sparkles size={24} />
                            <div>
                                <h3 className="text-lg font-bold">Ledger AI</h3>
                                <p className="text-xs opacity-90">Your Business Intelligence</p>
                            </div>
                        </header>

                        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
                            {conversation.map((msg, index) => <Message key={index} message={msg} />)}
                            {isPending && (
                                <div className="flex items-start gap-3">
                                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-white rounded-full shadow-md bg-gradient-to-br from-primary-500 to-secondary-500"><Bot size={18} /></div>
                                    <TypingIndicator />
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </main>

                        <footer className="flex-shrink-0 p-4 bg-white border-t rounded-b-2xl">
                            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask Ledger AI..."
                                    className="flex-1 px-4 py-2 bg-gray-100 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    disabled={isPending}
                                    autoComplete="off"
                                />
                                <motion.button
                                    type="submit"
                                    className="p-2 text-white rounded-full bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    disabled={isPending || !input.trim()}
                                    aria-label="Send message"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Send size={20} />
                                </motion.button>
                            </form>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
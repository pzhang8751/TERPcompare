import './Screen.css'
import AsyncSelect from 'react-select/async'
import { loadProfessors, loadCourses } from './SelectMenu'
import { IoArrowUp } from "react-icons/io5"
import { TbLoader } from "react-icons/tb";
import { useState, useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'

function usePersistedState<T>(key: string, defaultValue: T) {
    const [state, setState] = useState<T>(defaultValue)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        chrome.storage.local.get(key, (result) => {
            setState((result[key] ?? defaultValue) as T)
            setLoaded(true)
        });
    }, [key]);

    useEffect(() => {
        if (!loaded) return
        chrome.storage.local.set({ [key]: state })
    }, [state, loaded])

    return [state, setState] as const
}

export default function Screen() {
    const [chat, setChat] = usePersistedState<string[]>("chat", [])

    const [input, setInput] = usePersistedState<string>("input", '')
    const [prof, setProf] = usePersistedState<{ value: string | null; label: string } | null>("prof", { value: null, label: 'Professor' })
    const [course, setCourse] = usePersistedState<{ value: string | null; label: string } | null>("course", { value: null, label: 'Course' })

    const [warning, setWarning] = usePersistedState<string>("warning", '')

    const [isLoading, setIsLoading] = useState(false)

    const handleSend = async () => {
        if (prof?.value === null && course?.value === null) {
            setWarning("*Select at least either a professor course.")
        } else {
            const currentInput = input  // capture before clearing

            setIsLoading(true)
            setChat(prev => [...prev, currentInput])  // ← don't mutate directly

            chrome.runtime.sendMessage(
                { type: "QUERY", payload: { question: input, professor: prof?.value ?? null, course: course?.value ?? null } },
                (response) => {
                    if (!response.success) return;
                    console.log(response)

                    const fullText: string = response.data.answer
                    const words = fullText.split(" ")

                    // Fake streaming — reveal one word at a time
                    setChat(prev => [...prev, ""])
                    words.forEach((word, i) => {
                        setTimeout(() => {
                            setChat(prev => {
                                const updated = [...prev]
                                updated[updated.length - 1] += (i === 0 ? "" : " ") + word
                                return updated
                            })

                            //setting loading false after stream finishes
                            if (i === words.length - 1) {
                                setIsLoading(false)
                            }
                        }, i * 200) // 50ms per word, adjust to taste
                    })
                }
            )

            setInput('')
            setWarning('')
        }
    }

    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chat])

    return (
        <>
            <p>Hi! Welcome to Terp Compare</p>
            <p>Select a teacher, course, or none for both</p>
            <p>Ask away! </p>
            <div className="chat-container">
                {chat.map((message, index) => (
                    <div key={index} className={index % 2 == 0 ? "chat-prompt" : "chat-answer"}>{message}</div>
                ))}
                <div ref={messagesEndRef}></div>
            </div>
            <p className="warning">{warning}</p>
            <div className="prompt-container">
                <textarea rows={4} placeholder={"Ask..."} value={input} onChange={(e) => { setInput(e.target.value) }}
                    onKeyDown={(e) => {
                        if (input.trim() !== "" && !isLoading && e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSend()
                        }
                    }}
                    className="prompt-box"
                ></textarea>
                <div className="select-container">
                    <AsyncSelect loadOptions={loadProfessors}
                        defaultOptions={[{ label: 'None', value: null }]}
                        unstyled
                        classNamePrefix="select"
                        value={prof}
                        onChange={(option) => setProf(option)}
                        styles={{
                            option: base => ({
                                ...base,
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 12px',
                                cursor: 'pointer',
                            }),

                            noOptionsMessage: base => ({
                                ...base,
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 12px',
                            }),

                            loadingMessage: base => ({
                                ...base,
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 12px',
                                fontSize: '1rem',
                                color: 'inherit',
                                margin: 0,
                            })
                        }} />
                    <AsyncSelect loadOptions={loadCourses}
                        defaultOptions={[{ label: 'None', value: null }]}
                        unstyled
                        classNamePrefix="select"
                        value={course}
                        onChange={(option) => setCourse(option)}
                        styles={{
                            option: base => ({
                                ...base,
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 12px',
                                cursor: 'pointer',
                            })
                        }} />
                    <button
                        disabled={isLoading || !input.trim()}
                        className={`submit-button ${isLoading ? 'loading' : input.trim() ? 'active' : ''}`}
                        onClick={() => handleSend()}
                    >
                        {isLoading ? <TbLoader className="rotate"/> : <IoArrowUp />}
                    </button>
                </div>
            </div>
        </>
    )
}
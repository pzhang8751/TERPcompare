import './Screen.css'
import AsyncSelect from 'react-select/async'
import { loadProfessors, loadCourses } from './SelectMenu'
import { IoArrowUp } from "react-icons/io5";
import { useState } from 'react';

export default function Screen() {
    const [chat, setChat] = useState<string[]>([])

    const [input, setInput] = useState('')
    const [prof, setProf] = useState<{ value: string | null; label: string } | null>({ value: null, label: 'Professor' })
    const [course, setCourse] = useState<{ value: string | null; label: string } | null>({ value: null, label: 'Course' })

    const [warning, setWarning] = useState('')

    const handleSend = async () => {
        if (prof?.value === null && course?.value === null) {
            setWarning("*Select at least either a professor course.")
        } else {
            chat.push(input)
            setChat(chat)

            console.log(prof?.value)
            console.log(course?.value)
             
            chrome.runtime.sendMessage(
                { type: "QUERY", payload: { question: input, professor: prof?.value ?? null, course: course?.value ?? null } },
                (response) => {
                    if (!response.success) return;
                        console.log(response)

                    const fullText: string = response.data.answer // adjust to your API's response shape
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
                        }, i * 50) // 50ms per word, adjust to taste
                    })
                }
            )

            setInput('')
            setWarning('')
        }
    }

    return (
        <>
            <p>Hi! Welcome to Terp Compare</p>
            <p>Select a teacher, course, or none for both</p>
            <p>Ask away! </p>
            <div className="chat-container">
                {chat.map((message, index) => (
                    <div key={index} className={index % 2 == 0 ? "chat-prompt" : "chat-answer"}>{message}</div>
                ))}
            </div>
            <p className="warning">{warning}</p>
            <div className="prompt-container">
                <textarea rows={4} placeholder={"Ask..."} value={input} onChange={(e) => { setInput(e.target.value) }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
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
                    <button className={input.trim() ? "submit-button active" : "submit-button"} onClick={() => handleSend()}><IoArrowUp /></button>
                </div>
            </div>
        </>
    )
}
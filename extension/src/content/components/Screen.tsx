import './Screen.css'
import AsyncSelect from 'react-select/async'
import { loadProfessors, loadCourses } from './SelectMenu'
import { IoArrowUp } from "react-icons/io5";
import { useState } from 'react';

export default function Screen() {
    const [chat, setChat] = useState<string[]>([])

    const [input, setInput] = useState('')
    const [prof, setProf] = useState<{ value: string; label: string } | null>({ value: 'null', label: 'Professor' })
    const [course, setCourse] = useState<{ value: string; label: string } | null>({ value: 'null', label: 'Course' })

    const [warning, setWarning] = useState('')

    const handleSend = async () => {
        if (prof?.value === 'null' && course?.value === 'null') {
            setWarning("*Select at least either a professor course.")
        } else {
            chat.push(input)
            setChat(chat)

            // fetching ai response
            const response = await fetch("https://terpcompare-production.up.railway.app/api/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: input.trim(),
                    professor: prof?.value === 'null' ? null : prof?.value,
                    course: course?.value === 'null' ? null : course?.value
                })
            })

            const reader = response.body!.getReader()
            const decoder = new TextDecoder()

            // updating chat in stream-like visual response 
            setChat(prev => [...prev, ""])
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const token = decoder.decode(value)

                setChat(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] += token
                    return updated
                })
            }

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
                        defaultOptions={[{ label: 'None', value: 'null' }]}
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
                        defaultOptions={[{ label: 'None', value: 'null' }]}
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
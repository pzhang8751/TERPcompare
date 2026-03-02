import './Screen.css'
import Select from 'react-select'
import { IoArrowUp } from "react-icons/io5";
import { useState } from 'react';
// import 'react-select/dist/react-select.css'

export default function Screen() {
    const [chat, setChat] = useState<string[]>([])

    const [input, setInput] = useState('')
    const [prof, setProf] = useState<{ value: string; label: string } | null>({ value: 'null', label: 'Professor' })
    const [course, setCourse] = useState<{ value: string; label: string } | null>({ value: 'null', label: 'Course' })

    const options = [
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' }
    ]

    const [warning, setWarning] = useState('')

    const handleSend = () => {
        if (prof?.value === 'null' && course?.value === 'null') {
            setWarning("*Select at least either a professor course.")
        } else {
            chat.push(input)
            setChat(chat)
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
                    <div key={index} className={index%2 == 0 ? "chat-prompt" : "chat-answer"}>{message}</div>
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
                    <Select options={options} unstyled classNamePrefix="select"
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
                            })
                        }} />
                    <Select options={options} unstyled classNamePrefix="select" 
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
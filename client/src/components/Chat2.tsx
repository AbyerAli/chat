import React, { useEffect, useMemo, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import './Chat2.css'

// const socket: Socket = io('http://localhost:3005', {
// 	auth: {
// 		token: ''
// 	}
// })

type messageType = {
	message: string
	senderId: string
}

const Chat2 = ({ userId, username }: { userId: string; username: string }) => {
	// Room State
	const [room, setRoom] = useState<string>('')

	// Messages States
	const [message, setMessage] = useState<string>('')
	const [messages, setMessages] = useState<{ message: messageType }[]>([])

	const socket = useMemo(() => {
		if (!userId) null
		return io('http://localhost:3005', {
			auth: {
				token: userId
			}
		})
	}, [userId])

	const joinRoom = () => {
		if (room !== '') {
			socket.emit('join_room', room)
			alert(`Joined room ${room}`)
		}
	}

	const sendMessage = () => {
		if (message !== '' && room !== '') {
			socket.emit('send_message', { message, room })
			setMessage('') // Clear the input after sending the message
		}
		const messagesBox = document.getElementById('messagesBox')
		// Scroll to the bottom of the messages box
		if (messagesBox) {
			messagesBox.scrollTop = messagesBox.scrollHeight
		}

	}

	useEffect(() => {
		const receiveMessage = (data: { message: messageType }) => {
			setMessages(prevMessages => [...prevMessages, data])
		}

		// Subscribe to the event when the component mounts
		socket.on('receive_message', receiveMessage)

		// Clean up the effect when the component unmounts
		return () => {
			socket.off('receive_message', receiveMessage)
		}
	}, [socket])

	return (
		<div className='flex flex-col justify-center items-center'>
			<div className='chat flex w-2/5 flex-col justify-center items-center'>
				<input
					placeholder='Room Number...'
					onChange={event => {
						setRoom(event.target.value)
					}}
					className='w-full rounded-3xl mt-1'
				/>
				<button className='m-2 border border-black-50 p-3 w-full rounded-3xl bg-black text-white' onClick={joinRoom}>
					{' '}
					Join Room
				</button>
				<div className='ChatBox'>
					<input
						className='chatTextArea m-2'
						placeholder='Message...'
						value={message} // Add this line to control the input
						onChange={event => {
							setMessage(event.target.value)
						}}
					/>
					<button
						className='m-2 p-3 chatBtn text-center'
						onClick={sendMessage}
					>
						{' '}
						Send
					</button>
					<h1 className='p-2 w-full text-center bg-slate-200 text-xl capitalize'>{username}</h1>
					<div className='chat flex w-full flex-col p-2'>
						<div className='messages' id='messagesBox'>
							{messages.map((msg: any, index) => (
								<p key={index} className={msg?.user_id == userId ? 'w-fit border border-neutral-50 p-2 rounded-md d-flex justify-end ml-auto myMsg mb-2' : 'otherMsg mb-2'} >
									<span className='font-semibold mr-1 capitalize'>
										[{msg.user_name}]
									</span>
									{msg.message_text}
								</p>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>

	)
}

export default Chat2

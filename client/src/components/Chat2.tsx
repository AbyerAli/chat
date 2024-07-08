import React, { useEffect, useMemo, useState } from 'react'
import { io, Socket } from 'socket.io-client'

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
		<div className='chat flex w-52 flex-col'>
			<input
				placeholder='Room Number...'
				onChange={event => {
					setRoom(event.target.value)
				}}
			/>
			<button className='m-2 border border-neutral-50 p-3' onClick={joinRoom}>
				{' '}
				Join Room
			</button>
			<input
				placeholder='Message...'
				value={message} // Add this line to control the input
				onChange={event => {
					setMessage(event.target.value)
				}}
			/>
			<button
				className='m-2 border border-neutral-50 p-3'
				onClick={sendMessage}
			>
				{' '}
				Send Message
			</button>
			<h1> Messages:</h1>
			<div className='chat flex w-52 flex-col'>
				<div className='messages'>
					{messages.map((msg: any, index) => (
						<p key={index} className={msg?.senderId == userId ? 'border border-neutral-50 p-3 rounded-md': ''} >{msg.message}</p>
					))}
				</div>
			</div>
		</div>
	)
}

export default Chat2

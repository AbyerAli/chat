import Chat from 'components/Chat'
import Chat2 from 'components/Chat2'
import Login from 'components/Login'
import { useState } from 'react'

const ChatPage = () => {
	const [username, setUsername] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [userId, setUserId] = useState<string | null>(null)

	return (
		<div>
			<h1 className='text-xl text-center bg-slate-300 p-5 font-bold'>Real-Time Chat App</h1>
			{userId ? (
				// If the user is logged in, render the Chat component
				<Chat2 userId={userId} username={username} />
			) : (
				<Login
					username={username}
					setUsername={setUsername}
					password={password}
					setPassword={setPassword}
					setUserId={setUserId}
				/>
			)}
		</div>
	)
}

export default ChatPage

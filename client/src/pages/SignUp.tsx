interface LoginProps {
	username: string
	setUsername: React.Dispatch<React.SetStateAction<string>>
	password: string
	setPassword: React.Dispatch<React.SetStateAction<string>>
	setUserId: React.Dispatch<React.SetStateAction<string|null>>
}

const Signup = ({
	username,
	setUsername,
	password,
	setPassword,
	setUserId
}: LoginProps) => {
	const handleLogin = async () => {
		const res = await fetch('http://localhost:3005/api/v1/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: username,
				password: password
			})
		})
		const data = await res.json()
		if (data?.status == 'OK') {
			setUserId(data.id)
      localStorage.setItem('username', data.username)
      localStorage.setItem('userId', data.id)
		} else {
      alert('invalid credentials')
    }
		console.log(data)
	}

	return (
		<div className='mt-7 w-96 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900'>
			<div className='p-4 sm:p-7'>
				<div className='text-center'>
					<h1 className='block text-2xl font-bold text-gray-800 dark:text-white'>
						Sign in
					</h1>
					<p className='mt-2 text-sm text-gray-600 dark:text-neutral-400'>
						Don't have an account yet?
						<a
							className='font-medium text-blue-600 decoration-2 hover:underline dark:text-blue-500'
							href='../examples/html/signup.html'
						>
							Sign up here
						</a>
					</p>
				</div>

				<div className='mt-5'>
					<form
						onSubmit={e => {
							e.preventDefault()
							handleLogin()
						}}
					>
						<div className='grid gap-y-4'>
							<div>
								<label
									htmlFor='username'
									className='mb-2 block text-sm dark:text-white'
								>
									Email address
								</label>
								<div className='relative'>
									<input
										type='username'
										id='username'
										name='username'
										className='block w-full rounded-lg border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600'
										required
										aria-describedby='username-error'
										value={username}
										onChange={e => setUsername(e.target.value)}
									/>
									<div className='pointer-events-none absolute inset-y-0 end-0 hidden pe-3'>
										<svg
											className='size-5 text-red-500'
											width='16'
											height='16'
											fill='currentColor'
											viewBox='0 0 16 16'
											aria-hidden='true'
										>
											<path d='M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z' />
										</svg>
									</div>
								</div>
								<p
									className='mt-2 hidden text-xs text-red-600'
									id='email-error'
								>
									Please include a valid email address so we can get back to you
								</p>
							</div>
							<div>
								<div className='flex items-center justify-between'>
									<label
										htmlFor='password'
										className='mb-2 block text-sm dark:text-white'
									>
										Password
									</label>
									<a
										className='text-sm font-medium text-blue-600 decoration-2 hover:underline'
										href='../examples/html/recover-account.html'
									>
										Forgot password?
									</a>
								</div>
								<div className='relative'>
									<input
										value={password}
										onChange={e => setPassword(e.target.value)}
										type='password'
										id='password'
										name='password'
										className='block w-full rounded-lg border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600'
										required
										aria-describedby='password-error'
									/>
									<div className='pointer-events-none absolute inset-y-0 end-0 hidden pe-3'>
										<svg
											className='size-5 text-red-500'
											width='16'
											height='16'
											fill='currentColor'
											viewBox='0 0 16 16'
											aria-hidden='true'
										>
											<path d='M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z' />
										</svg>
									</div>
								</div>
								<p
									className='mt-2 hidden text-xs text-red-600'
									id='password-error'
								>
									8+ characters required
								</p>
							</div>
							<div className='flex items-center'>
								<div className='flex'>
									<input
										id='remember-me'
										name='remember-me'
										type='checkbox'
										className='mt-0.5 shrink-0 rounded border-gray-200 text-blue-600 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:checked:border-blue-500 dark:checked:bg-blue-500 dark:focus:ring-offset-gray-800'
									/>
								</div>
								<div className='ms-3'>
									<label
										htmlFor='remember-me'
										className='text-sm dark:text-white'
									>
										Remember me
									</label>
								</div>
							</div>
							<button
								type='submit'
								className='inline-flex w-full items-center justify-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50'
							>
								Sign in
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default Signup

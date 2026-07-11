import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

type User = {    
  id: number
  name: string
  phone: string
  email: string
}

type Form = {  
  name: string
  phone: string
  email: string
}

export default function CodeTestsPage() {

  const [users, setUsers] = useState<User[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  const emptyForm: Form = {
    name: '',
    phone: '',
    email: ''
  }

  const [form, setForm] = useState<Form>(emptyForm);

  const handleAddUser = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const trimmedName = form.name.trim()
    const trimmedPhone = form.phone.trim()
    const trimmedEmail = form.email.trim()

    if (!trimmedName || !trimmedPhone || !trimmedEmail) {
        setFormError('Name, phone, and email are all required.')
        return
    }

    setUsers( (currentUsers) => [
        ...currentUsers,
        {
        id: currentUsers.length > 0 ? currentUsers[currentUsers.length - 1].id + 1 : 1,
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        },
    ])

    setForm ({
      name: 'defaultName',
      phone: '+1 000 000 000',
      email: 'default@email.com',
    });
 
    // setName('defaultName')
    // setPhone('+1 000 000 000')
    // setEmail('default@email.com')
  }

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setForm ( (currentForm) => ({
      ...currentForm,
      [name]: value
    }))
  }

  // useEffect( () => {
  //   fetch('https://viacep.com.br/ws/01001000/json/')
  //   .then( response => response.json() )
  //   .then( data => console.log('data viacep', data) )
  // }, [users])

  

  useEffect( () => {

    const fetchData = async () => {
      const response = await fetch('https://viacep.com.br/ws/01001000/json/');
      const responseJson = await response.json();

      console.log('data viacep', responseJson);
    };

    fetchData();

  }, [users])

  return (    
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">My table for multiple tests</h1>
            <p className="text-sm text-slate-500">
              Fill the form below to add a user row to the table.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddUser} className="mb-6 grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Name
            <input
              name="name"
              value={form.name}
              onChange={handleFormChange}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Full name"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Phone
            <input
              name="phone"
              value={form.phone}
              onChange={handleFormChange}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Phone number"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Email
            <input
              name="email"
              value={form.email}
              onChange={handleFormChange}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Email address"
            />
          </label>

          <div className="sm:col-span-3 flex items-end gap-3">
            <Button type="submit">Add user</Button>
            <Button type="button" variant="secondary" onClick={() => {
              setFormError(null)
            }}>
              Clear
            </Button>
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          </div>
        </form>

        <table className="min-w-full divide-y divide-slate-200 border-collapse border border-slate-400">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-200">
                <td className="px-4 py-3 text-slate-900">{user.name}</td>
                <td className="px-4 py-3 text-slate-900">{user.phone}</td>
                <td className="px-4 py-3 text-slate-900">{user.email}</td>
              </tr>
            ))}
            {users.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-slate-500" colSpan={3}>
                  No users added yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </main>
  )
}
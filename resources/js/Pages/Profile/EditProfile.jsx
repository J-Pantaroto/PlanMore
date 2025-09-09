import React, { useState, useEffect } from 'react';
import Shell from '../../Layouts/Shell';

export default function EditProfile() {
  const [profile, setProfile] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetch('/profile', { method: 'GET', credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao carregar perfil');
        return res.json();
      })
      .then((data) => setProfile({ name: data.name || '', email: data.email || '', password: '' }))
      .catch((err) => console.error('Erro ao carregar perfil:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    try {
      const res = await fetch('/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(profile),
        credentials: 'include',
      });

      if (res.status === 422) {
        const json = await res.json();
        setErrors(json.errors || {});
      } else if (!res.ok) {
        console.error('Falha ao atualizar perfil:', await res.text());
      }
    } catch (err) {
      console.error('Erro ao enviar dados:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-8">Gerenciar Perfil</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text" id="name" name="name" value={profile.name} onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Endereço de E-mail</label>
          <input
            type="email" id="email" name="email" value={profile.email} onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
          <input
            type="password" id="password" name="password" value={profile.password} onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-violet-700 text-white rounded-md hover:bg-violet-800"
          disabled={processing}
        >
          {processing ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </Shell>
  );
}

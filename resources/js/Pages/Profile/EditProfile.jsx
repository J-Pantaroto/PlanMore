import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function EditProfile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetch('/profile', {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao carregar perfil');
        }
        return response.json();
      })
      .then((data) => {
        setProfile({
          name: data.name,
          email: data.email,
        });
      })
      .catch((error) => {
        console.error('Erro ao carregar perfil:', error);
      });
  }, []);  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      const response = await fetch('/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
        credentials: 'include', 
      });

      if (response.status === 422) {
        const json = await response.json();
        setErrors(json.errors || {});
      } else if (response.ok) {
        console.log('Perfil atualizado com sucesso');
      } else {
        console.error('Falha ao atualizar perfil:', await response.text());
      }
    } catch (err) {
      console.error('Erro ao enviar dados:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-56 bg-white border-r border-gray-200 p-5">
        <h2 className="flex items-center gap-2 text-xl font-bold mb-8">
          <ApplicationLogo className="h-6 w-6" />
          PlanMore
        </h2>
        <nav className="flex flex-col gap-2">
          <Link to="/dashboard" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            📊 Dashboard
          </Link>
          <Link to="/transactions" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            💰 Transações
          </Link>
          <Link to="/profile/edit" className="flex items-center gap-2 p-2 rounded-lg bg-purple-100 text-purple-700">
            👤 Conta
          </Link>
          <Link to="/preferences" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            ⚙️ Preferências
          </Link>
        </nav>
      </div>

      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-8">Gerenciar Perfil</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Endereço de E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              value={profile.password}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            disabled={processing}
          >
            {processing ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
}

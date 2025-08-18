import { useState, useRef } from "react";
import route from "ziggy-js";

import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";

export default function UpdatePasswordForm({ className = "" }) {
  const passwordInput = useRef();
  const currentPasswordInput = useRef();

  const [data, setData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);

  const updatePassword = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      const res = await fetch(route("password.update"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.status === 422) {
        const json = await res.json();
        setErrors(json.errors || {});

        if (json.errors.password) {
          passwordInput.current.focus();
        }

        if (json.errors.current_password) {
          currentPasswordInput.current.focus();
        }
      } else if (res.ok) {
        setRecentlySuccessful(true);
        setTimeout(() => setRecentlySuccessful(false), 2000); // reset the success message after 2 seconds
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className={className}>
      <header>
        <h2 className="text-lg font-medium text-gray-900">Atualizar Senha</h2>
        <p className="mt-1 text-sm text-gray-600">
          Garanta que sua conta esteja usando uma senha longa e aleatória para
          manter sua segurança.
        </p>
      </header>

      <form onSubmit={updatePassword} className="mt-6 space-y-6">
        <div>
          <InputLabel htmlFor="current_password" value="Senha Atual" />
          <TextInput
            id="current_password"
            ref={currentPasswordInput}
            value={data.current_password}
            onChange={(e) =>
              setData({ ...data, current_password: e.target.value })
            }
            type="password"
            className="mt-1 block w-full"
            autoComplete="current-password"
          />
          <InputError message={errors.current_password} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="password" value="Nova Senha" />
          <TextInput
            id="password"
            ref={passwordInput}
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            type="password"
            className="mt-1 block w-full"
            autoComplete="new-password"
          />
          <InputError message={errors.password} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="password_confirmation" value="Confirmar Senha" />
          <TextInput
            id="password_confirmation"
            value={data.password_confirmation}
            onChange={(e) =>
              setData({ ...data, password_confirmation: e.target.value })
            }
            type="password"
            className="mt-1 block w-full"
            autoComplete="new-password"
          />
          <InputError message={errors.password_confirmation} className="mt-2" />
        </div>

        <div className="flex items-center gap-4">
          <PrimaryButton disabled={processing}>
            {processing ? "Salvando..." : "Salvar"}
          </PrimaryButton>

          <Transition
            show={recentlySuccessful}
            enter="transition ease-in-out"
            enterFrom="opacity-0"
            leave="transition ease-in-out"
            leaveTo="opacity-0"
          >
            <p className="text-sm text-gray-600">Salvo.</p>
          </Transition>
        </div>
      </form>
    </section>
  );
}

import { useState, useRef } from "react";
import DangerButton from "@/Components/DangerButton";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import route from "ziggy-js";

export default function DeleteUserForm({ className = "" }) {
  const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
  const [data, setData] = useState({ password: "" });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const passwordInput = useRef();

  const confirmUserDeletion = () => {
    setConfirmingUserDeletion(true);
  };

  const deleteUser = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      const res = await fetch(route("profile.destroy"), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(data),
      });

      if (res.status === 422) {
        const json = await res.json();
        setErrors(json.errors || {});
        passwordInput.current.focus();
      } else if (res.ok) {
        closeModal();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const closeModal = () => {
    setConfirmingUserDeletion(false);
    setErrors({});
    setData({ password: "" });
  };

  return (
    <section className={`space-y-6 ${className}`}>
      <header>
        <h2 className="text-lg font-medium text-gray-900">Deletar Conta</h2>
        <p className="mt-1 text-sm text-gray-600">
          Após a exclusão, todos os recursos e dados da sua conta serão
          permanentemente apagados. Antes de deletar sua conta, faça o download
          de quaisquer dados ou informações que deseje manter.
        </p>
      </header>

      <DangerButton onClick={confirmUserDeletion}>Deletar Conta</DangerButton>

      <Modal show={confirmingUserDeletion} onClose={closeModal}>
        <form onSubmit={deleteUser} className="p-6">
          <h2 className="text-lg font-medium text-gray-900">
            Tem certeza de que deseja excluir sua conta?
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Uma vez que sua conta seja deletada, todos os seus recursos e
            dados serão apagados permanentemente. Digite sua senha para
            confirmar que deseja excluir sua conta permanentemente.
          </p>

          <div className="mt-6">
            <InputLabel htmlFor="password" value="Senha" className="sr-only" />
            <TextInput
              id="password"
              type="password"
              name="password"
              ref={passwordInput}
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className="mt-1 block w-3/4"
              isFocused
              placeholder="Senha"
            />
            <InputError message={errors.password} className="mt-2" />
          </div>

          <div className="mt-6 flex justify-end">
            <SecondaryButton onClick={closeModal}>Cancelar</SecondaryButton>
            <DangerButton className="ms-3" disabled={processing}>
              Deletar Conta
            </DangerButton>
          </div>
        </form>
      </Modal>
    </section>
  );
}

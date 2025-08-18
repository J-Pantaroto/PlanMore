import { useState } from "react";
import route from "ziggy-js";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";

export default function ConfirmPassword() {
  const [data, setData] = useState({ password: "" });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      await fetch(route("sanctum.csrf-cookie"), { credentials: "include" });

      const res = await fetch(route("password.confirm"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ password: data.password }),
      });

      if (res.status === 422) {
        const json = await res.json();
        setErrors(json.errors || {});
      } else if (res.ok) {
        window.history.back();
      } else {
        console.error("Falha ao confirmar senha:", await res.text());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
      setData({ password: "" });
    }
  };

  return (
    <GuestLayout>
      <div className="mb-4 text-sm text-gray-600">
        This is a secure area of the application. Please confirm your password
        before continuing.
      </div>

      <form onSubmit={submit}>
        <div className="mt-4">
          <InputLabel htmlFor="password" value="Password" />
          <TextInput
            id="password"
            type="password"
            name="password"
            value={data.password}
            className="mt-1 block w-full"
            autoComplete="current-password"
            onChange={(e) => setData({ password: e.target.value })}
            required
          />
          <InputError message={errors.password?.[0]} className="mt-2" />
        </div>

        <div className="mt-4 flex items-center justify-end">
          <PrimaryButton className="ms-4" disabled={processing}>
            {processing ? "Confirming..." : "Confirm"}
          </PrimaryButton>
        </div>
      </form>
    </GuestLayout>
  );
}

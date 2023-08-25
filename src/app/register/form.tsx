"use client";

import { signIn } from "next-auth/react";
import { ChangeEvent, useState } from "react";
import { SIGNUP_MUTATION } from './Mutations';
import { useMutation } from '@apollo/client';

export const RegisterForm = () => {
    const [signup] = useMutation(SIGNUP_MUTATION);
  let [loading, setLoading] = useState(false);
  let [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // try {
    //   const res = await fetch("/api/register", {
    //     method: "POST",
    //     body: JSON.stringify(formValues),
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   });

    //   setLoading(false);
    //   if (!res.ok) {
    //     alert((await res.json()).message);
    //     return;
    //   }

    //   signIn(undefined, { callbackUrl: "/" });
    // } catch (error: any) {
    //   setLoading(false);
    //   console.error(error);
    //   alert(error.message);
    // }
    console.log(formValues);
    try {
        const response = await signup({
          variables: {
            lastName: formValues.name,
            name: formValues.name,
            email: formValues.email,
            password: formValues.password,
          },
        });
        setLoading(false);
        const token = response.data.signup.token;
        // Stockez le token dans le localStorage ou les cookies
        console.log('User registered successfully');
        signIn(undefined, { callbackUrl: "/" });

  
          
      } catch (error: any) {
        setLoading(false);
        console.error(error);
        alert(error.message);
        if (error.message.includes('Cet utilisateur existe déjà')) {
            // Affichez le message d'erreur approprié à l'utilisateur
            console.log('Cet utilisateur existe déjà');
          } else {
            console.error('Error during registration:', error);
          }
      console.error('Error during registration:', error);
      }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        width: 500,
        rowGap: 10,
      }}
    >
      <label htmlFor="name">Name</label>
      <input
        required
        type="text"
        name="name"
        value={formValues.name}
        onChange={handleChange}
        style={{ padding: "1rem" }}
      />
      <label htmlFor="email">Email</label>
      <input
        required
        type="email"
        name="email"
        value={formValues.email}
        onChange={handleChange}
        style={{ padding: "1rem" }}
      />
      <label htmlFor="password">Password</label>
      <input
        required
        type="password"
        name="password"
        value={formValues.password}
        onChange={handleChange}
        style={{ padding: "1rem" }}
      />
      <button
        style={{
          backgroundColor: `${loading ? "#ccc" : "#3446eb"}`,
          color: "#fff",
          padding: "1rem",
          cursor: "pointer",
        }}
        disabled={loading}
      >
        {loading ? "loading..." : "Register"}
      </button>
    </form>
  );
};

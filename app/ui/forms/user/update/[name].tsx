import { useRouter } from "next/router";

export default function UpdateUser() {
  const router = useRouter();
  const { name, id, email, type } = router.query;

  return (
    <div>
      <h1>Editar Usuário: {name}</h1>
      <p><strong>ID:</strong> {id}</p>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Tipo:</strong> {type}</p>
      {/* Agora você pode preencher um formulário de edição com os dados passados */}
    </div>
  );
}

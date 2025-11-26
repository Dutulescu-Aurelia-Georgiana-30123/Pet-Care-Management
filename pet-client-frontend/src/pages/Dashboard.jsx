export default function Dashboard({ owner }) {
  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 16 }}>
      <h1>Welcome, {owner.name}!</h1>
      <p>Email: {owner.email}</p>
      <p>Phone: {owner.phone}</p>

      <p style={{ marginTop: 20 }}>
        (Later: aici facem My Pets & My Appointments)
      </p>
    </div>
  );
}
//jfghfjnbdhsdjkfghjkdfbghjdsklfnsgjbvskdjbfvhdxfvndbkbfvdfkjgvkfbgdhgbjfgn
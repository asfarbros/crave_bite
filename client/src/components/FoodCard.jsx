function FoodCard({ item }) {
  return (
    <div style={{
      border: "1px solid #ccc",
      borderRadius: "10px",
      width: "250px",
      margin: "10px",
      padding: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}>
      <img src={item.image} alt={item.name} style={{ width: "100%", borderRadius: "8px" }} />
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <p><strong>₹{item.price}</strong></p>
      <button style={{ padding: "5px 10px", background: "#4CAF50", color: "white", border: "none", borderRadius: "5px" }}>
        Add to Cart
      </button>
    </div>
  );
}

export default FoodCard;

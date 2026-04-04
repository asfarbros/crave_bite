import menuItems from "../data/menuData";
import FoodCard from "../components/FoodCard";

function Menu() {
  return (
    <div>
      <h1>Explore Our Menu</h1>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        {menuItems.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default Menu;

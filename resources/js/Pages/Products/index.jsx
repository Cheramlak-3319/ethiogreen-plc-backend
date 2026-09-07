import React from "react";

const Index = ({ products }) => {
    return (
        <div>
            {products.map((product) => (
                <div key={product.id}>
                    <h2>{product.name}</h2>
                    <p>{product.price}</p>

                    <p>{product.image}</p>

                    <img
                        src={product.image}
                        alt={product.name}
                        width={100}
                        height={100}
                    />
                </div>
            ))}
        </div>
    );
};

export default Index;

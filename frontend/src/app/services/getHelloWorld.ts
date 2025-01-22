export const getHelloWorld = async () => {
    try {
      const response = await fetch(`http://localhost:80/getHelloWorld.php`);
      
      if (!response.ok) {
        throw new Error("Erro ao buscar a mensagem.");
      }
  
      const data = await response.json(); // O retorno será { message: "Hello, World!" }
  
      console.log(data.message); // Imprime "Hello, World!" no console
      return data.message;
    } catch (error) {
      console.error("Erro ao tentar obter a mensagem:", error);
      return null;
    }
  };
  
useEffect(() => {
  fetch("http://localhost/find-animal-friend-react/api/pets.php")
    .then(res => res.json())
    .then(data => {
      console.log("PETS:", data);
      setPets(data);
    })
    .catch(err => console.error("Erro:", err));
}, []);
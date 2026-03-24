export async function fetchJoke() {
  const res = await fetch('https://v2.jokeapi.dev/joke/Any');

  try {
    return await res.json();
  } catch {
    return { error: true, message: 'Invalid JSON from JokeAPI' };
  }
}

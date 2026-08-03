export async function getReviews(env) {
  console.log("judgeme.server loaded");

  const response = await fetch(
    `https://judge.me/api/v1/reviews?shop_domain=${env.SHOP_DOMAIN}&api_token=${env.JUDGEME_PRIVATE_API_TOKEN}`,
  );

  console.log("Judge.me status:", response.status);

  if (!response.ok) {
    throw new Error(`Judge.me API failed: ${response.status}`);
  }

  return response.json();
}
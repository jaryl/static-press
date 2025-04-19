async function main(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ event, context })
  }
}

export { main };

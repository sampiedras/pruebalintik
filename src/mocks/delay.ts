export function delay(ms = 500): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function randomLatency(minMs = 500, maxMs = 1000): number {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
}

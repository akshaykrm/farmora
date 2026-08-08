class NetworkError extends Error {
  code: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "Network Error";
    this.code = code || "Network_Error";

    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export default NetworkError;

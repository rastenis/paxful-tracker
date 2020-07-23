import axios from "axios";

export async function request(path: string, data?: string): Promise<any> {
  const result = await axios({
    method: "POST",
    url: "https://paxful.com/api/" + path,
    data: data,
    headers: { "Content-Type": "text/plain", Accept: "application/json" },
  });

  return result.data;
}

import axios from "axios";

export function request(path: string, data?: string): Promise<any> {
  return new Promise((res, rej) => {
    axios({
      method: "POST",
      url: "https://paxful.com/api/" + path,
      data: data,
      headers: { "Content-Type": "text/plain", Accept: "application/json" }
    })
      .then(r => {
        return res(r.data);
      })
      .catch(e => {
        return rej(e);
      });
  });
}

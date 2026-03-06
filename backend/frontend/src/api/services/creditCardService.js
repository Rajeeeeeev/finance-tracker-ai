import client from "./client"; // your existing axios client

export const creditCardService = {
  getAll:        ()       => client.get("/api/credit-cards/"),
  getSummary:    ()       => client.get("/api/credit-cards/summary/"),
  getOne:        (id)     => client.get(`/api/credit-cards/${id}/`),
  getExpenses:   (id)     => client.get(`/api/credit-cards/${id}/expenses/`),
  create:        (data)   => client.post("/api/credit-cards/", data),
  update:        (id, data) => client.put(`/api/credit-cards/${id}/`, data),
  remove:        (id)     => client.delete(`/api/credit-cards/${id}/`),
};
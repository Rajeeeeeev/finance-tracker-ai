import client from "../client";

export const creditCardService = {
  getAll:        ()         => client.get("/credit-cards/"),
  getSummary:    ()         => client.get("/credit-cards/summary/"),
  getOne:        (id)       => client.get(`/credit-cards/${id}/`),
  getExpenses:   (id)       => client.get(`/credit-cards/${id}/expenses/`),
  create:        (data)     => client.post("/credit-cards/", data),
  update:        (id, data) => client.put(`/credit-cards/${id}/`, data),
  remove:        (id)       => client.delete(`/credit-cards/${id}/`),
};
const request = require("supertest");
const app = require("..");
const { clearDatabase } = require("../db.connection");
const req = request(app);

describe("lab testing:", () => {
  let userInDB;
  beforeAll(async () => {
    await clearDatabase();

    let myUser = {
      name: "youssef mohamed",
      email: "ym526415@gmail.com",
      password: "youssef2222",
    };

    await req.post("/user/signup").send(myUser);
  });

  describe("users routes:", () => {
    // Note: user name must be sent in req query not req params
    it("req to get(/search) ,expect to get the correct user with his name", async () => {
      const res = await req.get("/user/search?name=Akram Gaber");
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Akram Gaber");
    });

    it("req to get(/search) with invalid name ,expect res status and res message to be as expected", async () => {
      const res = await req.get("/user/search?name=Ahmed Mohamed");
      expect(res.status).toBe(200);
      expect(res.body.message).toBe(
        "There is no user with name: Ahmed Mohamed",
      );
    });

    it("req to delete(/) ,expect res status to be 200 and a message sent in res", async () => {
      const res = await req.delete("/user");
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("users have been deleted successfully");
    });
  });

  describe("todos routes:", () => {
    let token, todoInDB;
    beforeAll(async () => {
      let myUser = {
        name: "youssef mohamed",
        email: "ym526415@gmail.com",
        password: "youssef2222",
      };
      let res1 = await req.post("/user/signup").send(myUser);
      userInDB = res1.body.data;
      let res2 = await req.post("/user/login").send(myUser);
      token = res2.body.token;
      let res3 = await req
        .post("/todo")
        .send({ title: "new Todo" })
        .set({ authorization: token });
      todoInDB = res3.body.data;
    });

    it("req to patch(/) with id only ,expect res status and res message to be as expected", async () => {
      const res = await req
        .patch(`/todo/${todoInDB._id}`)
        .set({ authorization: token });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("must provide title and id to edit todo");
    });

    it("req to patch(/) with id and title ,expect res status and res to be as expected", async () => {
      const res = await req
        .patch(`/todo/${todoInDB._id}`)
        .send({ title: "new title" })
        .set({ authorization: token });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("new title");
    });

    it("req to get( /user) ,expect to get all user's todos", async () => {
      const res = await req.get("/todo/user").set({ authorization: token });
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("req to get( /user) ,expect to not get any todos for user hasn't any todo", async () => {
      const newUser = {
        name: "mohamed youssef",
        email: "m@gmail.com",
        password: "mmmm123",
      };
      const signupRes = await req.post("/user/signup").send(newUser);
      const newUserInDB = signupRes.body.data;
      const loginRes = await req.post("/user/login").send(newUser);
      const newToken = loginRes.body.token;

      const res = await req.get("/todo/user").set({ authorization: newToken });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(
        "Couldn't find any todos for " + newUserInDB._id,
      );
    });
  });

  afterAll(async () => {
    await clearDatabase();
  });
});

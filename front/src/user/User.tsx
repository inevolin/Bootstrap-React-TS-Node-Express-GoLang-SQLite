/* eslint-disable @typescript-eslint/no-unused-vars */
import "./User.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Button,
  EditableText,
  InputGroup,
  Toaster,
  Position,
} from "@blueprintjs/core";

import { API_ENDPOINT } from "../Shared";

type User = {
  id: string;
  name: string;
  email: string;
  website: string;
};

const AppToaster = Toaster.create({
  position: Position.TOP,
});

function User() {
  const navigate = useNavigate();

  // auth
  const [isLoggedIn, setLoggedIn] = useState(Boolean);
  useEffect(() => {
    fetch(`${API_ENDPOINT}/api/auth`, {
      headers: { Authorization: localStorage.getItem("jwt") as string },
    })
      .then((response) => response.json())
      .then((resp) => {
        console.log("ici", resp);
        setLoggedIn(resp);
        if (!resp) navigate("/"); // redirect
      })
      .catch(() => null);
  }, []);

  const [users, setUsers] = useState<User[]>([]);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newWebsite, setNewWebsite] = useState("");

  const getUsers = () => {
    fetch(`${API_ENDPOINT}/api/users`, {
      headers: { Authorization: localStorage.getItem("jwt") as string },
    })
      .then((response) => response.json())
      .then((json) => setUsers(json))
      .catch(() => null);
  };

  useEffect(() => {
    getUsers();
  }, []);

  const addUser = () => {
    const name = newName.trim();
    const email = newEmail.trim();
    const website = newWebsite.trim();
    if (name && email && website) {
      fetch(`${API_ENDPOINT}/api/users`, {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          website,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: localStorage.getItem("jwt") as string,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setUsers([...users, data]);
          setNewName("");
          setNewEmail("");
          setNewWebsite("");
          AppToaster.show({
            message: "User added successfully",
            intent: "success",
            timeout: 3000,
          });
          getUsers(); // NOTE: this is a bad workaround to hot-reload latest item (because retrieving its ID from SQLite is not working)
        })
        .catch((err) => {
          AppToaster.show({
            message: "Error: " + err,
            intent: "danger",
            timeout: 3000,
          });
        });
    }
  };

  const updateUser = (id: string) => {
    const user = users.find((user) => user.id === id);

    fetch(`${API_ENDPOINT}/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: localStorage.getItem("jwt") as string,
      },
    })
      .then((response) => response.json())
      .then(() => {
        AppToaster.show({
          message: "User updated successfully",
          intent: "success",
          timeout: 3000,
        });
      })
      .catch(() => null);
  };

  const deleteUser = (id: string) => {
    fetch(`${API_ENDPOINT}/api/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: localStorage.getItem("jwt") as string },
    })
      .then((response) => response.json())
      .then(() => {
        setUsers((values) => {
          return values.filter((item) => item.id !== id);
        });
        AppToaster.show({
          message: "User deleted successfully",
          intent: "success",
          timeout: 3000,
        });
      })
      .catch(() => null);
  };

  const onChangeHandler = (id: string, key: string, value: string) => {
    setUsers((values: User[]) => {
      return values.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      );
    });
  };

  return (
    <div className="App">
      <table className="bp4-html-table .modifier">
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Email</th>
            <th>Website</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>
                <EditableText
                  value={user.email}
                  onChange={(value) => onChangeHandler(user.id, "email", value)}
                />
              </td>
              <td>
                <EditableText
                  value={user.website}
                  onChange={(value) =>
                    onChangeHandler(user.id, "website", value)
                  }
                />
              </td>
              <td>
                <Button intent="primary" onClick={() => updateUser(user.id)}>
                  Update
                </Button>
                &nbsp;
                <Button intent="danger" onClick={() => deleteUser(user.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td></td>
            <td>
              <InputGroup
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Add name here..."
              />
            </td>
            <td>
              <InputGroup
                placeholder="Add email here..."
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </td>
            <td>
              <InputGroup
                placeholder="Add website here..."
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
              />
            </td>
            <td>
              <Button intent="success" onClick={addUser}>
                Add user
              </Button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default User;

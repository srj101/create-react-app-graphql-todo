import React, { Component } from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import * as compose from "lodash.flowright";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import ClearIcon from "@material-ui/icons/Clear";
import Form from "./Form";
import Notification from "./Notification";
import "./app.css";

const TodosQuery = gql`
  {
    todos {
      id
      text
      complete
    }
  }
`;

const UpdateMutation = gql`
  mutation ($id: ID!, $complete: Boolean) {
    updateTodo(id: $id, complete: $complete) {
      id
      text
      complete
    }
  }
`;

const RemoveMutation = gql`
  mutation ($id: ID!) {
    removeTodo(id: $id)
  }
`;

const CreateTodoMutation = gql`
  mutation ($text: String!) {
    createTodo(text: $text) {
      id
      text
      complete
    }
  }
`;

class App extends Component {
  state = {
    checked: [0],
  };

  updateTodo = async (todo) => {
    // Update todo
    await this.props.updateTodo({
      variables: {
        id: todo.id,
        complete: !todo.complete,
      },
      update: (store) => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: TodosQuery });
        // Add our comment from the mutation to the end.
        data.todos.map((x) =>
          x.id === todo.id
            ? {
                ...todo,
                complete: !todo.complete,
              }
            : x
        );
        // Write our data back to the cache.
        store.writeQuery({ query: TodosQuery, data });
      },
    });
  };

  removeTodo = async (todo) => {
    await this.props.removeTodo({
      variables: {
        id: todo.id,
      },
      update: (store) => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: TodosQuery });
        // Add our comment from the mutation to the end.
        const newTodos = data.todos.filter((x) => x.id !== todo.id);
        // Write our data back to the cache.
        store.writeQuery({ query: TodosQuery, data: { todos: [...newTodos] } });
      },
    });
  };
  createTodo = async (text) => {
    console.log(text);
    await this.props.createTodo({
      variables: {
        text,
      },
      update: (store, { data: { createTodo } }) => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: TodosQuery });
        // Add our comment from the mutation to the end.

        const newList = [createTodo, ...data.todos];

        // Write our data back to the cache.
        store.writeQuery({
          query: TodosQuery,
          data: {
            todos: newList,
          },
        });
      },
    });
  };

  render() {
    const {
      data: { loading, todos },
    } = this.props;

    if (todos === "undefined") {
      return (
        <div className="loading">
          <h1>There was a network error. Try Reloading</h1>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="loading">
          <img
            src="https://i.pinimg.com/originals/65/ba/48/65ba488626025cff82f091336fbf94bb.gif"
            alt=""
          />
        </div>
      );
    }
    return (
      <div className="App" style={{ display: "flex" }}>
        <Notification />

        <div style={{ margin: "auto", width: 400 }}>
          <Paper elevation={1}>
            <h1 className="text-center">TODO - MERNG</h1>
            <Form submit={this.createTodo} />
            <List>
              {todos.map((todo) => {
                const labelId = `checkbox-list-label-${todo}`;

                return (
                  <ListItem
                    key={todo.id}
                    role={undefined}
                    dense
                    button
                    onClick={() => this.updateTodo(todo)}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={todo.complete}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ "aria-labelledby": labelId }}
                      />
                    </ListItemIcon>
                    <ListItemText id={labelId} primary={todo.text} />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => this.removeTodo(todo)}>
                        <ClearIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </div>
      </div>
    );
  }
}

export default compose(
  graphql(CreateTodoMutation, { name: "createTodo" }),
  graphql(RemoveMutation, { name: "removeTodo" }),
  graphql(TodosQuery),
  graphql(UpdateMutation, { name: "updateTodo" })
)(App);

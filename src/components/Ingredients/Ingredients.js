import React, { useReducer, useEffect, useCallback, useMemo } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import Search from "./Search";
import useHttp from "../../hooks/http";
const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter(i => i.id !== action.id);
    default:
      throw new Error("Should not happen");
  }
};

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const { isLoading, sendRequest, data, extra, error, identifier,clear } = useHttp();
  
  useEffect(() => {
    if (!isLoading && !error) {
      switch (identifier) {
        case "ADD_INGRENDIENT":
          dispatch({
            type: "ADD",
            ingredient: { id: data.name, ...extra }
          });
          return;
        case "REMOVE_INGREDIENT":
          dispatch({
            type: "DELETE",
            id: extra
          });
          return;
        default:
      }
    }
  }, [data, extra, identifier, isLoading, error]);

  const addIngredientHandler = useCallback(
    async ingredient => {
      await sendRequest(
        "https://react-hooks-starter.firebaseio.com/ingredients.json",
        "POST",
        JSON.stringify(ingredient),
        ingredient,
        "ADD_INGRENDIENT"
      );
    },
    [sendRequest]
  );
  const removeIngredientHandler = useCallback(
    async id => {
      await sendRequest(
        `https://react-hooks-starter.firebaseio.com/ingredients/${id}.json`,
        "DELETE",
        null,
        id,
        "REMOVE_INGREDIENT"
      );
    },
    [sendRequest]
  );

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    dispatch({
      type: "SET",
      ingredients: filteredIngredients
    });
  }, []);

  

  const ingredientList = useMemo(() => {
    return (
      <IngredientList
        ingredients={userIngredients}
        onRemoveItem={removeIngredientHandler}
      />
    );
  }, [userIngredients, removeIngredientHandler]);

  return (
    <div className="App">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
};

export default Ingredients;

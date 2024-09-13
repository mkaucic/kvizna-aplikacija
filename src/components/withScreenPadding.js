import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  screenPadding: {
    height: "100%",
    overflowY: "auto",
    padding: theme.spacing(2),
    boxSizing: "border-box",
  },
}));

const withScreenPadding = (WrappedComponent) => {
  return (props) => {
    const classes = useStyles();
    return (
      <div className={classes.screenPadding}>
        <WrappedComponent {...props} />
      </div>
    );
  };
};

export default withScreenPadding;

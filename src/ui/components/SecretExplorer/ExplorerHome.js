// @flow
import React, {useState} from "react";
import {Button, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {div, format, gt, lt, fromFloatString} from "../../../ledger/grain";
import {type Account} from "../../../ledger/ledger";
import {type CurrencyDetails} from "../../../api/currencyConfig";
import AccountDropdown from "../AccountSelector";
import {useLedger} from "../../utils/LedgerContext";
import {CredView} from "../../../analysis/credView";
import sortBy from "../../../util/sortBy";
import CredTimeline from './CredTimeline';

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    minWidth: "1100px",
    margin: "0 auto",
    padding: "0 5em 5em",
  },
  arrowBody: {
    color: theme.palette.text.primary,
    flex: 1,
    background: theme.palette.background.paper,
    padding: "5px 20px",
    display: "flex",
    alignItems: "center",
  },
  triangle: {
    width: 0,
    height: 0,
    background: theme.palette.background,
    borderTop: "30px solid transparent",
    borderBottom: "30px solid transparent",
    borderLeft: `30px solid ${theme.palette.background.paper}`,
  },
  circle: {
    height: "150px",
    width: "150px",
    border: `1px solid ${theme.palette.text.primary}`,
    borderRadius: "50%",
  },
  centerRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  row: {display: "flex"},
  graph: {
    height: "150px",
    background: "lightgrey",
  },
  barChartWrapper: {flexGrow: 1, flexBasis: 0, margin: "20px"},
  tableWrapper: {flexGrow: 3, flexBasis: 0, margin: "20px"},
  // table: {
  //   height: "1000px",
  //   width: "100%",
  //   background: "lightgrey",
  // },
  barChart: {
    height: "500px",
    width: "100%",
    background: "lightgrey",
  },
  element: {flex: 1, margin: "20px"},
  arrowInput: {width: "40%", display: "inline-block"},
  pageHeader: {color: theme.palette.text.primary},
}));

type ExplorerHomeProps = {|
  +currency: CurrencyDetails,
  +initialView: CredView,
|};

export const ExplorerHome = ({
  currency: {name: currencyName, suffix: currencySuffix},
  initialView,
}: ExplorerHomeProps) => {
  const {ledger, updateLedger} = useLedger();

  const classes = useStyles();
  const [sender, setSender] = useState<Account | null>(null);
  const [receiver, setReceiver] = useState<Account | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [memo, setMemo] = useState<string>("");

  // const submitExplorerHome = () => {
  //   if (sender && receiver) {
  //     const nextLedger = ledger.TransferGrain({
  //       from: sender.identity.id,
  //       to: receiver.identity.id,
  //       amount: fromFloatString(amount),
  //       memo: memo,
  //     });
  //     updateLedger(nextLedger);
  //     setAmount("");
  //     setSender(nextLedger.account(sender.identity.id));
  //     setReceiver(nextLedger.account(receiver.identity.id));
  //     setMemo("");
  //   }
  // };

  const postLedger = () =>
    fetch("data/ledger.json", {
      headers: {
        Accept: "text/plain",
        "Content-Type": "text/plain",
      },
      method: "POST",
      body: ledger.serialize(),
    });

  const data = [
    {title: "Cred This Week", value: 610},
    {title: "Grain Harvested", value: "6,765g"},
    {title: "Active Partcipants", value: 13},
    {title: "Grain per Cred", value: "22g"},
  ]

  const createData = (name, calories, fat, carbs) => ({ name, calories, fat, carbs});

  const nodes = initialView.userNodes();
    // TODO: Allow sorting/displaying only recent cred...
    const sortedNodes = sortBy(nodes, (n) => -n.credSummary.cred);
    const credTimelines = sortedNodes.map((node) => node.credOverTime === null ? null : node.credOverTime.cred)

  const rows = [
    createData('Frozen yoghurt', 159, 6.0, credTimelines[0]),
    createData('Ice cream sandwich', 237, 9.0, credTimelines[1]),
    createData('Eclair', 262, 16.0, credTimelines[2]),
    createData('Cupcake', 305, 3.7, credTimelines[3]),
    createData('Gingerbread', 356, 16.0, credTimelines[4]),
  ];

  return (
    <Container className={classes.root}>
      <h1 className={`${classes.centerRow} ${classes.pageHeader}`}>
        Explorer Home
      </h1>
      <div className={`${classes.centerRow} ${classes.graph}`}>
        <h2>The graph</h2>
      </div>
      <div className={classes.centerRow}>
        <div
          className={`${classes.centerRow} ${classes.element}`}
          style={{ flexDirection: "column" }}
        >
          <div className={`${classes.centerRow} ${classes.circle}`}>
            {data[0].value}
          </div>
          <div>{data[0].title}</div>
        </div>
        <div
          className={`${classes.centerRow} ${classes.element}`}
          style={{ flexDirection: "column" }}
        >
          <div className={`${classes.centerRow} ${classes.circle}`}>
            {data[1].value}
          </div>
          <div>{data[1].title}</div>
        </div>
        <div
          className={`${classes.centerRow} ${classes.element}`}
          style={{ flexDirection: "column" }}
        >
          <div className={`${classes.centerRow} ${classes.circle}`}>
            {data[2].value}
          </div>
          <div>{data[2].title}</div>
        </div>
        <div
          className={`${classes.centerRow} ${classes.element}`}
          style={{ flexDirection: "column" }}
        >
          <div className={`${classes.centerRow} ${classes.circle}`}>
            {data[3].value}
          </div>
          <div>{data[3].title}</div>
        </div>
      </div>
      <div  className={classes.row} >
        <div className={classes.tableWrapper} style={{ flexDirection: "column" }}>
          <h2>Last Week's Activity:</h2>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Participant</TableCell>
                  <TableCell>Cred</TableCell>
                  <TableCell>Grain</TableCell>
                  <TableCell>Contributions Chart (ALL TIME)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell>{row.calories}</TableCell>
                    <TableCell>{row.fat}</TableCell>
                    <TableCell align="right">
                      <CredTimeline data={row.carbs} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <div className={classes.barChartWrapper} style={{ flexDirection: "column" }}>
          <h2>Cred By Plugin</h2>
          <div className={classes.barChart}>
            Bar Chart
          </div>
        </div>
      </div>
    </Container>
  );
};

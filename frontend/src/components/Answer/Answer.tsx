import { useEffect, useMemo, useState } from "react";
import { useBoolean } from "@fluentui/react-hooks";
import { FontIcon, Stack, Text } from "@fluentui/react";

import styles from "./Answer.module.css";

import { AskResponse, Citation } from "../../api";
import { parseAnswer } from "./AnswerParser";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import supersub from "remark-supersub";

interface Props {
  answer: AskResponse;
  onCitationClicked: (citedDocument: Citation) => void;
}

export const Answer = ({ answer, onCitationClicked }: Props) => {
  const [isRefAccordionOpen, { toggle: toggleIsRefAccordionOpen }] =
    useBoolean(false);
  const filePathTruncationLimit = 50;

  const parsedAnswer = useMemo(() => parseAnswer(answer), [answer]);
  const [chevronIsExpanded, setChevronIsExpanded] =
    useState(isRefAccordionOpen);

  const handleChevronClick = () => {
    setChevronIsExpanded(!chevronIsExpanded);
    toggleIsRefAccordionOpen();
  };

  useEffect(() => {
    setChevronIsExpanded(isRefAccordionOpen);
  }, [isRefAccordionOpen]);

  const createCitationFilepath = (
    citation: Citation,
    index: number,
    truncate: boolean = false
  ) => {
    let citationFilename = "";

    if (citation.filepath && citation.chunk_id) {
      if (truncate && citation.filepath.length > filePathTruncationLimit) {
        const citationLength = citation.filepath.length;
        citationFilename = `${citation.filepath.substring(
          0,
          20
        )}...${citation.filepath.substring(citationLength - 20)} - Part ${
          parseInt(citation.chunk_id) + 1
        }`;
      } else {
        citationFilename = `${citation.filepath} - Part ${
          parseInt(citation.chunk_id) + 1
        }`;
      }
    } else {
      citationFilename = `Citation ${index}`;
    }
    return citationFilename;
  };

  return (
    <>
      <Stack className={styles.answerContainer} tabIndex={0}>
        <Stack.Item grow>
            {/* <pre style={{whiteSpace: "pre-wrap"}}>
                {answer.answer}
            </pre> */}
          <ReactMarkdown
            linkTarget="_blank"
            remarkPlugins={[remarkGfm, supersub]}
            children={parsedAnswer.markdownFormatText}
            className={styles.answerText}
          />
        </Stack.Item>
        <Stack horizontal className={styles.answerFooter}>
          <Stack.Item className={styles.answerDisclaimerContainer}>
            <span className={styles.answerDisclaimer}>
              AI-generated content may be incorrect
            </span>
          </Stack.Item>
        </Stack>
      </Stack>
    </>
  );
};

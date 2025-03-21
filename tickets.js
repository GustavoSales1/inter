const axios = require("axios");

// Configurar APIs
const INTERCOM_API_URL = "https://api.intercom.io/conversations/search";
const INTERCOM_TOKEN = "Bearer dG9rOjBmZTE1YjM0XzU4NzdfNDYzZl84MTIxXzBiMWM1MmEyOWJiMToxOjA=";
const headers = {
  Cookie: "JSESSIONID=2QWOhcaztsbOqL9lDy4nl2UKF8AIgx2WxpvN0q7A",
  "Content-Type": "application/json",
};

// Timestamps para o range de datas (exemplo)
const startDate = 1699488000; // Timestamp de início (20/03/2025)
const endDate = 1740528000;   // Timestamp de fim (21/03/2025)

// Função para buscar as conversas no Intercom com o range de datas
async function getIntercomConversations() {
  try {
    const response = await axios.post(
      INTERCOM_API_URL,
      {
        pagination: { per_page: 100 },
        query: {
          operator: "AND",
          value: [
            {
              field: "created_at",
              operator: ">",
              value: startDate,  // Start date timestamp
            },
            {
              field: "created_at",
              operator: "<",
              value: endDate,  // End date timestamp
            },
          ],
        },
      },
      { headers: { Authorization: INTERCOM_TOKEN, "Content-Type": "application/json" } }
    );
    return response.data.conversations;
  } catch (error) {
    console.error("Erro ao buscar Intercom:", error.response?.data || error);
    return [];
  }
}

// Função para verificar se o chamado tem integração com Jira ITSM
async function checkJiraITSM(conversation) {
  const jiraITSM = conversation.custom_attributes?.jira_itsm; // Verifique o nome correto do atributo no Intercom
  
  if (jiraITSM) {
    return true; // Tem integração com Jira ITSM
  }
  return false; // Não tem integração com Jira ITSM
}

// Função para validar todos os tickets
async function validateTickets() {
  const conversations = await getIntercomConversations();
  
  const integratedTickets = []; // Array para armazenar os tickets com integração

  for (const convo of conversations) {
    const intercomId = convo.id;

    // Verifica se o ticket tem integração com Jira ITSM
    if (await checkJiraITSM(convo)) {
      integratedTickets.push(intercomId); // Adiciona o ticket à lista de integrados
    }
  }

  // Mostra todos os tickets que têm integração com Jira ITSM
  if (integratedTickets.length > 0) {
    console.log("Tickets com integração Jira ITSM:");
    integratedTickets.forEach(ticket => console.log(`Ticket ${ticket} tem integração com Jira ITSM.`));
  } else {
    console.log("Não há tickets com integração Jira ITSM.");
  }

  // Mostra os tickets que não têm integração com Jira ITSM
  for (const convo of conversations) {
    const intercomId = convo.id;
    if (!integratedTickets.includes(intercomId)) {
      console.log(`🚨 Ticket ${intercomId} NÃO tem integração com Jira ITSM.`);
    }
  }
}

validateTickets();

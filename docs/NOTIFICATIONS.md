# Sistema de Notificações de Agendamento

## 📱 Funcionalidades

### Ícone de Notificação
- **Localização**: Header do aplicativo, ao lado do botão de configurações
- **Ícone**: Sino (Bell) com badge de contagem
- **Estados**:
  - **Inativo** (cinza): Sem agendamentos próximos
  - **Ativo** (azul com badge vermelho): Agendamentos nos próximos 30 minutos

### Notificações em Tempo Real
- **Verificação automática**: O sistema verifica constantemente os agendamentos
- **Janela de notificação**: 30 minutos antes do horário agendado
- **Som de notificação**: Toca automaticamente quando um novo agendamento entra na janela de 30 minutos
- **Animação**: O ícone anima (bounce + pulse) quando uma nova notificação é detectada

### Comportamento
1. **Detecção**: O sistema detecta agendamentos marcados para os próximos 30 minutos
2. **Som**: Toca um beep suave usando Web Audio API
3. **Badge**: Mostra o número de agendamentos próximos
4. **Navegação**: Clicar no ícone leva direto para a aba AGENDA

## 🔧 Implementação Técnica

### Arquivos Criados
- `components/AppointmentNotification.tsx`: Componente principal de notificação
- `utils/notificationSound.ts`: Utilitário para tocar som de notificação

### Lógica de Notificação
```typescript
// Calcula agendamentos próximos (próximos 30 minutos)
const upcomingAppointments = appointments.filter(app => {
  // Apenas agendamentos de hoje com status AGENDADO
  // Que estejam entre 0 e 30 minutos no futuro
});
```

### Som de Notificação
- Usa Web Audio API nativa do navegador
- Frequência: 800 Hz (tom agradável)
- Duração: 0.5 segundos
- Volume: 30% (não intrusivo)

## 🎨 Design
- **Badge vermelho**: Destaque visual para notificações pendentes
- **Animação bounce**: Chama atenção quando há nova notificação
- **Animação pulse**: Mantém o ícone pulsando enquanto há notificações
- **Tooltip**: Mostra quantidade de agendamentos ao passar o mouse

## 📊 Casos de Uso
1. **Barbeiro esqueceu do agendamento**: Notificação 30 min antes
2. **Cliente chegando**: Aviso visual e sonoro
3. **Organização do dia**: Badge mostra quantos clientes estão próximos

## 🔄 Atualizações Futuras Possíveis
- [ ] Configurar tempo de antecedência (15, 30, 60 minutos)
- [ ] Personalizar som de notificação
- [ ] Notificações push (PWA)
- [ ] Histórico de notificações
- [ ] Snooze de notificações

import React from "react";
import AppShell from "../components/AppShell.jsx";

export default function Education() {
  return (
    <AppShell title="Educação & Apoio">
      <div className="page-content section-card">
        <section className="section-block">
          <h2>Por que adotar com responsabilidade?</h2>
          <p>
            A adoção é um compromisso de longo prazo. O animal precisa de atenção,
            amor, alimentação adequada e cuidados veterinários. O app ajuda a
            encontrar o pet certo, e esta área traz dicas para cuidar bem dele.
          </p>
        </section>

        <section className="section-block">
          <h3>Antes da adoção</h3>
          <ul>
            <li>Verifique se seu lar oferece espaço, rotina e clima adequados.</li>
            <li>Escolha um pet compatível com sua experiência e tempo disponível.</li>
            <li>Prepare uma área segura com caminha, ração e brinquedos.</li>
            <li>Planeje o transporte até a ONG ou abrigo com calma.</li>
          </ul>
        </section>

        <section className="section-block">
          <h3>Primeiras semanas</h3>
          <ul>
            <li>Respeite o tempo de adaptação e evite mudanças bruscas.</li>
            <li>Ofereça abrigo, água fresca e alimentação em horários regulares.</li>
            <li>Mostre carinho aos poucos; alguns pets podem ser inseguros no início.</li>
            <li>Leve o novo amigo ao veterinário para checar vacinas e saúde.</li>
          </ul>
        </section>

        <section className="section-block">
          <h3>Cuidados contínuos</h3>
          <ul>
            <li>Mantenha vacinações e vermifugação em dia.</li>
            <li>Ofereça exercícios diários e estimulação mental.</li>
            <li>Observe sinais de estresse, dor ou mudanças de apetite.</li>
            <li>Crie rotina para passeios, alimentação e descanso.</li>
          </ul>
        </section>

        <section className="section-block">
          <h3>Apoio pós-adoção</h3>
          <p>
            Marque um pet como adotado em "Matches" para registrar o compromisso.
            Depois, confira orientações de alimentação, higiene e socialização.
          </p>
          <p>
            Se tiver dúvidas, procure ajuda de ONG, veterinário ou grupos de apoio
            animal da sua região.
          </p>
        </section>
      </div>
    </AppShell>
  );
}

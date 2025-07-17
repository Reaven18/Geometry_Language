// ✅ PARSER COMPLETO Y FUNCIONAL

class AnalizadorSintactico {
    constructor() {
        this.tokens = [];
        this.token_actual = null;
        this.indice = 0;
        this.errores = [];
        this.tokensTabla = {
            AVANZAR: 1000,
            APAGAR: 1010,
            ENCENDER: 1100,
            RETROCEDER: 1240,
            IZQUIERDA: 1180,
            DERECHA: 1080,
            INICIO: 3030,
            FIN: 3040,
            PUNTO_COMA: 3020,
            PAREN_IZQ: 5000,
            PAREN_DER: 5010,
            DECISION: 1060,
            CICLO: 1040,
            PAUSA: 1220,
            IDENTIFICADOR: 6000,
            INT: 1170,
            IGUAL: 2060
        };
    }

    cargarTokens(tokens) {
        this.tokens = tokens;
        this.indice = 0;
        this.token_actual = this.tokens[0];
    }

    avanzar() {
        this.indice++;
        if (this.indice < this.tokens.length) {
            this.token_actual = this.tokens[this.indice];
        } else {
            this.token_actual = null;
        }
    }

    coincidir(tipoEsperado) {
        if (this.token_actual && this.token_actual.tipo === tipoEsperado) {
            this.avanzar();
            return true;
        } else {
            return false;
        }
    }

    analizar() {
        const ast = this.programa();
        if (this.errores.length === 0 && this.token_actual === null) {
            return { exito: true, arbol: ast };
        } else {
            return { exito: false, errores: this.errores };
        }
    }

    programa() {
        if (!this.coincidir(this.tokensTabla.INICIO)) {
            this.reportarError("Se esperaba 'inicio' al comienzo del programa");
            return null;
        }
        const sentencias = this.listaSentencias();
        if (!this.coincidir(this.tokensTabla.FIN)) {
            this.reportarError("Se esperaba 'fin' al final del programa");
        }
        return { tipo: 'Programa', cuerpo: sentencias };
    }

    listaSentencias() {
        const sentencias = [];
        while (this.token_actual && this.token_actual.tipo !== this.tokensTabla.FIN) {
            const sentencia = this.sentencia();
            if (sentencia) sentencias.push(sentencia);
        }
        return sentencias;
    }

    sentencia() {
        const t = this.token_actual;
        if (!t) return null;

        switch (t.tipo) {
            case this.tokensTabla.AVANZAR:
            case this.tokensTabla.APAGAR:
            case this.tokensTabla.ENCENDER:
            case this.tokensTabla.RETROCEDER:
            case this.tokensTabla.IZQUIERDA:
            case this.tokensTabla.DERECHA:
            case this.tokensTabla.PAUSA:
                return this.comandoRobot();
            case this.tokensTabla.INT:
                return this.declaracion();
            case this.tokensTabla.DECISION:
                return this.decision();
            default:
                this.reportarError(`Sentencia inesperada: '${t.valor}'`);
                this.avanzar();
                return null;
        }
    }

    comandoRobot() {
        const comando = this.token_actual.valor;
        this.avanzar();
        if (this.coincidir(this.tokensTabla.PAREN_IZQ)) {
            if (this.token_actual && this.token_actual.tipo === this.tokensTabla.IDENTIFICADOR) {
                this.avanzar();
            }
            if (!this.coincidir(this.tokensTabla.PAREN_DER)) {
                this.reportarError("Se esperaba ')' en comando");
            }
        }
        if (!this.coincidir(this.tokensTabla.PUNTO_COMA)) {
            this.reportarError("Se esperaba ';' después del comando");
        }
        return { tipo: 'Comando', nombre: comando };
    }

    declaracion() {
        this.avanzar();
        if (!this.coincidir(this.tokensTabla.IDENTIFICADOR)) {
            this.reportarError("Falta identificador en declaración");
            return null;
        }
        if (!this.coincidir(this.tokensTabla.PUNTO_COMA)) {
            this.reportarError("Falta ';' después de declaración");
        }
        return { tipo: 'Declaracion' };
    }

    decision() {
        this.avanzar(); // Consumir 'decisión'
        const cuerpo = [];

        if (!this.coincidir(this.tokensTabla.PAREN_IZQ)) {
            this.reportarError("Falta '(' en decisión");
        }

        if (this.token_actual && this.token_actual.tipo === this.tokensTabla.IDENTIFICADOR) {
            this.avanzar();
        }

        if (!this.coincidir(this.tokensTabla.PAREN_DER)) {
            this.reportarError("Falta ')' en decisión");
        }

        if (!this.coincidir(this.tokensTabla.PUNTO_COMA)) {
            this.reportarError("Falta ';' después de decisión");
        }

        return { tipo: 'Decision', cuerpo };
    }

    reportarError(mensaje) {
        this.errores.push(mensaje);
    }

    // 🔁 NUEVO: Permitir ordenamiento por flechas entre bloques
    ordenarTokensPorFlechas(placedFigures) {
        const visitados = new Set();
        const resultado = [];

        const mapaIdFigura = new Map();
        for (const fig of placedFigures) {
            mapaIdFigura.set(fig.id, fig);
        }

        function dfs(figura) {
            if (!figura || visitados.has(figura.id)) return;
            visitados.add(figura.id);
            resultado.push(figura);

            for (const flecha of figura.flechas || []) {
                const destino = placedFigures.find(f => f.nodos.includes(flecha.apuntadorE));
                if (destino) dfs(destino);
            }
        }

        const inicio = placedFigures.find(f => f.shapeType.toLowerCase() === 'inicio');
        if (inicio) dfs(inicio);
        return resultado;
    }
}
